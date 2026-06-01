import { formatCurrency } from "@/lib/format";
import { evaluateTransferPolicy, isWhitelistedDestination } from "@/lib/policy";
import type { PolicySettings, Transfer } from "@/lib/types";

export type BriefingVerdict = "authorize" | "review" | "escalate";

export type BriefingFact = { label: string; value: string };

export type TransactionBriefingContext = {
  verdict: BriefingVerdict;
  verdictLabel: string;
  facts: BriefingFact[];
  reasons: string[];
  fallbackNarrative: string;
};

const VERDICT_LABELS: Record<BriefingVerdict, string> = {
  authorize: "Authorize",
  review: "Hold for review",
  escalate: "Escalate",
};

/** Optional live custody context fetched server-side from Fireblocks. */
export type TreasuryLiveContext = {
  vaultName: string;
  assetLabel: string;
  available: number;
  fundingStatus: "ready" | "needs_funding";
} | null;

function resolveVerdict(riskLevel: Transfer["riskLevel"], requiresApproval: boolean): BriefingVerdict {
  if (riskLevel === "high") return "escalate";
  if (riskLevel === "medium" || requiresApproval) return "review";
  return "authorize";
}

/**
 * Deterministic grounding for the AI transaction summary. The verdict and facts
 * are computed from policy — never from the model — so the recommendation cannot
 * be hallucinated. The model only writes the narrative around these facts.
 */
export function buildTransactionBriefingContext(
  transfer: Transfer,
  policy: PolicySettings,
  live?: TreasuryLiveContext,
): TransactionBriefingContext {
  const evaluation = evaluateTransferPolicy({
    amount: transfer.amount,
    destination: transfer.destination,
    policy,
  });
  const whitelisted = isWhitelistedDestination(transfer.destination, policy);
  const verdict = resolveVerdict(evaluation.riskLevel, evaluation.requiresApproval);

  const facts: BriefingFact[] = [
    { label: "Settlement", value: `${transfer.id} · ${formatCurrency(transfer.amount, transfer.asset)}` },
    {
      label: "Destination",
      value: `${transfer.destinationLabel} — ${whitelisted ? "allowlisted" : "NOT allowlisted"}`,
    },
    { label: "Source vault", value: transfer.sourceVault ?? "Treasury Main" },
    { label: "Settlement rail", value: transfer.settlementRail ?? "Ethereum Sepolia" },
    {
      label: "Policy",
      value: evaluation.policyTrigger
        ? `${evaluation.policyTrigger} · risk ${evaluation.riskLevel}`
        : `within tolerance · risk ${evaluation.riskLevel}`,
    },
  ];

  if (live) {
    facts.push({
      label: "Vault balance",
      value: `${live.available} ${live.assetLabel} available · ${
        live.fundingStatus === "ready" ? "funded" : "needs funding"
      }`,
    });
  }

  if (transfer.fireblocksStatus) {
    facts.push({ label: "Fireblocks status", value: transfer.fireblocksStatus });
  }

  const reasons = evaluation.reasons.length
    ? evaluation.reasons
    : ["Destination is allowlisted and the amount is within the manager-approval threshold."];

  return {
    verdict,
    verdictLabel: VERDICT_LABELS[verdict],
    facts,
    reasons,
    fallbackNarrative: buildFallbackNarrative(transfer, evaluation.riskLevel, whitelisted, reasons, live),
  };
}

function buildFallbackNarrative(
  transfer: Transfer,
  riskLevel: Transfer["riskLevel"],
  whitelisted: boolean,
  reasons: string[],
  live?: TreasuryLiveContext,
): string {
  const amount = formatCurrency(transfer.amount, transfer.asset);
  const vault = transfer.sourceVault ?? "Treasury Main";
  const rail = transfer.settlementRail ?? "Ethereum Sepolia";

  const allowlist = whitelisted
    ? "The destination is on the approved allowlist"
    : "The destination is NOT on the approved allowlist, which is the primary risk on this settlement";

  const balanceNote = live
    ? ` ${vault} holds ${live.available} ${live.assetLabel} available${
        live.fundingStatus === "ready" ? "" : " and may require funding before release"
      }.`
    : "";

  const custody =
    "Funds leave the Fireblocks MPC custody boundary only after Treasury Manager co-signer approval, with TAP policy enforced at the custody layer and webhook lifecycle tracking on the settlement.";

  return `This settlement releases ${amount} from ${vault} to ${transfer.destinationLabel} over ${rail}. ${allowlist}; risk is assessed as ${riskLevel}. ${reasons[0]}${balanceNote} ${custody}`;
}

/** Prompt sent to the model — strictly grounded in the deterministic context. */
export function buildBriefingPrompt(
  transfer: Transfer,
  context: TransactionBriefingContext,
): { system: string; prompt: string } {
  const system = [
    "You are a treasury settlement risk assistant embedded in an institutional Fireblocks custody workflow.",
    "You write a concise authorization briefing for a Treasury Manager who is about to release a settlement through Fireblocks MPC custody.",
    "Rules:",
    "- Use ONLY the facts provided. Never invent balances, addresses, counterparties, or policy outcomes.",
    "- 2-4 sentences, institutional and factual tone. No bullet points, no headings.",
    "- Explain what the settlement does, the allowlist/threshold posture, which Fireblocks controls apply (MPC signing, TAP policy, co-signer release), and what the manager should weigh.",
    `- The governance verdict has already been computed as "${context.verdictLabel}". Align your briefing with it; do not contradict it.`,
  ].join("\n");

  const facts = context.facts.map((f) => `- ${f.label}: ${f.value}`).join("\n");
  const reasons = context.reasons.map((r) => `- ${r}`).join("\n");

  const prompt = [
    "Settlement facts:",
    facts,
    "",
    "Policy reasoning:",
    reasons,
    "",
    `Settlement note: ${transfer.reason}`,
    "",
    "Write the authorization briefing now.",
  ].join("\n");

  return { system, prompt };
}
