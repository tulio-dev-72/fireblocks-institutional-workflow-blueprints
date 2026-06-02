"use client";

import {
  FIREBLOCKS_TAP_POLICY,
  FIREBLOCKS_TAP_POLICY_META,
  getTapActionLabel,
  type TapRule,
  type TapRuleAction,
} from "@/data/fireblocks-tap-policy";
import { Card, SectionHeader } from "@/components/ui/primitives";
import { InfoTooltip } from "@/components/ui/info-tooltip";

function ActionBadge({ action }: { action: TapRuleAction }) {
  const style =
    action === "ALLOW"
      ? "bg-ops-success-muted text-ops-success ring-1 ring-ops-success/30"
      : action === "BLOCK"
        ? "bg-ops-danger-muted text-ops-danger ring-1 ring-ops-danger/30"
        : "bg-ops-warning-muted text-ops-warning ring-1 ring-ops-warning/30";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style}`}
    >
      {getTapActionLabel(action)}
    </span>
  );
}

function RuleField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ops-text-dim">
        {label}
      </span>
      <span className="truncate text-[11px] font-medium text-ops-text" title={value}>
        {value}
      </span>
    </div>
  );
}

function RuleCard({ rule }: { rule: TapRule }) {
  return (
    <article className="rounded-lg border border-ops-border bg-ops-overlay/50 px-3 py-2.5">
      <div className="flex items-center justify-between">
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-ops-overlay px-1.5 text-[10px] font-bold tabular-nums text-ops-text-secondary ring-1 ring-ops-border-subtle">
          {rule.order}
        </span>
        <ActionBadge action={rule.action} />
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
        <RuleField label="Initiator" value={rule.initiator} />
        <RuleField label="Type" value={rule.type} />
        <RuleField label="Asset" value={rule.asset} />
        <RuleField label="Source" value={rule.source} />
        <RuleField label="Destination" value={rule.destination} />
        <RuleField label="Amount" value={rule.amount} />
        <RuleField label="Signer" value={rule.signer} />
      </div>
    </article>
  );
}

function MirrorBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-ops-overlay px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-ops-text-secondary ring-1 ring-ops-border-subtle">
      <span className="h-1.5 w-1.5 rounded-full bg-ops-text-dim" aria-hidden />
      Read-only mirror
    </span>
  );
}

export function TapPolicyPanel() {
  return (
    <Card variant="elevated">
      <SectionHeader
        label="Fireblocks · Transaction Authorization Policy"
        title="Governing policy"
        subtitle={FIREBLOCKS_TAP_POLICY_META.enforcement}
        action={<MirrorBadge />}
        titleHintLabel="What is the Transaction Authorization Policy?"
        titleHint="Fireblocks' Transaction Authorization Policy (TAP) is a rule engine that evaluates every transaction — by initiator, source, destination, asset, and amount — and decides to allow, block, or require approval before it can be signed. It is enforced at the MPC custody layer, so it cannot be bypassed by the application."
      />

      <div className="space-y-2">
        {FIREBLOCKS_TAP_POLICY.map((rule) => (
          <RuleCard key={rule.order} rule={rule} />
        ))}
      </div>

      <p className="mt-3 border-t border-ops-border pt-2.5 text-[10px] leading-relaxed text-ops-text-dim">
        <span className="font-semibold uppercase tracking-[0.1em] text-ops-text-secondary">
          Source ·{" "}
        </span>
        {FIREBLOCKS_TAP_POLICY_META.source}. {FIREBLOCKS_TAP_POLICY_META.mirrorNote}
      </p>

      <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-ops-border-subtle bg-ops-overlay/40 px-3 py-2">
        <p className="text-[10px] leading-relaxed text-ops-text-dim">
          <span className="font-semibold uppercase tracking-[0.1em] text-ops-text-secondary">
            Demo scope ·{" "}
          </span>
          The manager authorization gate is enforced at the application layer in this demo. Custom
          TAP rules couldn&apos;t be authored in this sandbox, so the rules above are the workspace&apos;s
          existing policy, shown read-only.
        </p>
        <InfoTooltip
          label="Why is the gate enforced in the app?"
          content="In a hardened production deployment the approval gate binds to Fireblocks TAP, so the MPC custody layer itself enforces it and even a compromised app server can't release funds. This sandbox doesn't permit authoring restrictive TAP rules, so the app performs the gate and Fireblocks executes the signing. The custody, signing, and webhook lifecycle are still real."
          side="top"
          align="end"
          className="ml-auto shrink-0"
        />
      </div>
    </Card>
  );
}
