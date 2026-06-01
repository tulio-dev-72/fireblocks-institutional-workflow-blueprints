import type { AuditEvent, Transfer, VaultBalance } from "@/lib/types";
import { AUDIT_ACTIONS } from "@/lib/audit";
import {
  destinationPresets,
  fireblocksDemoDestination,
} from "@/data/initial-data";

export type DemoScenario = {
  blueprintId: string;
  headline: string;
  queueSummary: string;
  batchLabel: string;
  transfers: Transfer[];
  auditLog: AuditEvent[];
  vaultBalances: VaultBalance[];
  walkthrough: {
    step: number;
    title: string;
    detail: string;
    href: string;
  }[];
};

const t1 = "2026-05-24T14:02:00.000Z";
const t2 = "2026-05-24T14:04:00.000Z";
const t3 = "2026-05-24T14:06:00.000Z";

function applyVaultLedger(
  vaults: VaultBalance[],
  transfers: Transfer[],
): VaultBalance[] {
  const asset = vaults[0]?.asset ?? "ETH_TEST5";
  const startingBalance = vaults[0]?.balance ?? 0;

  let balance = startingBalance;
  for (const transfer of transfers) {
    if (transfer.status === "SETTLED" || transfer.status === "APPROVED") {
      balance -= transfer.amount;
    }
  }

  const pendingOut = transfers
    .filter(
      (transfer) =>
        transfer.status === "PENDING_APPROVAL" || transfer.status === "CREATED",
    )
    .reduce((sum, transfer) => sum + transfer.amount, 0);

  return vaults.map((vault) =>
    vault.asset === asset
      ? {
          ...vault,
          balance,
          pendingOut,
          available: Math.max(balance - pendingOut, 0),
        }
      : vault,
  );
}

const stablecoinScenario: DemoScenario = {
  blueprintId: "stablecoin-payouts",
  headline: "Sepolia ETH settlement — authorization required",
  queueSummary:
    "Analyst initiates a Sepolia test ETH settlement to Acme Liquidity LLC. Policy triggers high-value authorization before Fireblocks custody release.",
  batchLabel: "Primary operational scenario",
  transfers: [],
  auditLog: [],
  vaultBalances: [],
  walkthrough: [
    {
      step: 1,
      title: "Initiate settlement",
      detail: "Analyst submits Sepolia test ETH settlement from Treasury Main.",
      href: "/demo/create",
    },
    {
      step: 2,
      title: "Policy evaluation",
      detail: "High-value authorization triggered — settlement held pending treasury manager review.",
      href: "/demo/policy",
    },
    {
      step: 3,
      title: "Authorize release",
      detail: "Treasury Manager authorizes settlement — Fireblocks creates the transaction.",
      href: "/demo/approvals",
    },
    {
      step: 4,
      title: "Audit trail",
      detail: "Webhook lifecycle and authorization events recorded for compliance review.",
      href: "/demo/audit",
    },
  ],
};

const treasuryScenario: DemoScenario = {
  blueprintId: "treasury-approval",
  headline: "High-value disbursement awaiting sign-off",
  queueSummary:
    "Treasury analyst requested a $142K-equivalent outbound to a new counterparty wallet. Policy requires CFO office approval before Fireblocks releases from custody.",
  batchLabel: "1 pending approval · 1 cleared today",
  transfers: [
    {
      id: "TRX-DEMO-001",
      asset: "ETH_TEST5",
      amount: 0.012,
      destination: fireblocksDemoDestination.address,
      destinationLabel: "New counterparty treasury wallet",
      reason: "Treasury disbursement — inter-company transfer ($142K equiv.)",
      status: "PENDING_APPROVAL",
      riskLevel: "high",
      requiresApproval: true,
      createdBy: "Analyst",
      createdByRole: "analyst",
      createdAt: t2,
      updatedAt: t2,
    },
    {
      id: "TRX-DEMO-002",
      asset: "ETH_TEST5",
      amount: 0.001,
      destination: destinationPresets[1].address,
      destinationLabel: destinationPresets[1].label,
      reason: "Treasury rebalance — approved counterparty",
      status: "SETTLED",
      riskLevel: "low",
      requiresApproval: false,
      createdBy: "Analyst",
      createdByRole: "analyst",
      fireblocksStatus: "COMPLETED",
      createdAt: t1,
      updatedAt: t1,
    },
  ],
  auditLog: [
    {
      id: "AUD-TREAS-001",
      action: AUDIT_ACTIONS.settlementRequestCreated,
      actor: "Analyst",
      role: "analyst",
      timestamp: t1,
      details: "TRX-DEMO-002 rebalance submitted and auto-cleared.",
    },
    {
      id: "AUD-TREAS-002",
      action: AUDIT_ACTIONS.settlementRequestCreated,
      actor: "Policy Engine",
      role: "admin",
      timestamp: t1,
      details: "TRX-DEMO-002 settled via Fireblocks.",
    },
    {
      id: "AUD-TREAS-003",
      action: AUDIT_ACTIONS.settlementRequestCreated,
      actor: "Analyst",
      role: "analyst",
      timestamp: t2,
      details: "TRX-DEMO-001 submitted — high-value treasury disbursement.",
    },
    {
      id: "AUD-TREAS-004",
      action: AUDIT_ACTIONS.policyWorkflowEvaluated,
      actor: "Policy Engine",
      role: "admin",
      timestamp: t2,
      details:
        "TRX-DEMO-001 requires dual authorization — destination not on approved list.",
    },
    {
      id: "AUD-TREAS-005",
      action: AUDIT_ACTIONS.authorizationSubmitted,
      actor: "Analyst",
      role: "analyst",
      timestamp: t2,
      details: "TRX-DEMO-001 routed to Treasury Manager approval queue.",
    },
  ],
  vaultBalances: [],
  walkthrough: [
    {
      step: 1,
      title: "Treasury dashboard — liquidity + queue",
      detail: "See vault balance, pending disbursement, and what already cleared today.",
      href: "/demo",
    },
    {
      step: 2,
      title: "Review the disbursement request",
      detail: "High-value outbound to a new counterparty — policy blocked auto-release.",
      href: "/demo/approvals",
    },
    {
      step: 3,
      title: "Manager approves from mobile",
      detail: "Dual authorization complete → Fireblocks signs and settles from custody.",
      href: "/demo/approvals",
    },
    {
      step: 4,
      title: "Audit trail for regulators",
      detail: "Requester, approver, policy outcome, and Fireblocks settlement timestamp.",
      href: "/demo/audit",
    },
  ],
};

const withdrawalScenario: DemoScenario = {
  blueprintId: "exchange-withdrawal-review",
  headline: "Exchange withdrawal held for desk review",
  queueSummary:
    "Trading desk requested withdrawal to an external venue. Omnibus-to-exchange transfers auto-clear; this destination is new — manager must approve before Fireblocks broadcasts.",
  batchLabel: "1 withdrawal pending · 1 cleared to omnibus",
  transfers: [
    {
      id: "TRX-DEMO-001",
      asset: "ETH_TEST5",
      amount: 0.008,
      destination: fireblocksDemoDestination.address,
      destinationLabel: "External venue — hot wallet (new)",
      reason: "Exchange withdrawal — liquidity rebalance to external venue",
      status: "PENDING_APPROVAL",
      riskLevel: "high",
      requiresApproval: true,
      createdBy: "Analyst",
      createdByRole: "analyst",
      createdAt: t2,
      updatedAt: t2,
    },
    {
      id: "TRX-DEMO-002",
      asset: "ETH_TEST5",
      amount: 0.003,
      destination: destinationPresets[2].address,
      destinationLabel: destinationPresets[2].label,
      reason: "Exchange withdrawal — approved omnibus route",
      status: "SETTLED",
      riskLevel: "low",
      requiresApproval: false,
      createdBy: "Analyst",
      createdByRole: "analyst",
      fireblocksStatus: "COMPLETED",
      createdAt: t1,
      updatedAt: t1,
    },
  ],
  auditLog: [
    {
      id: "AUD-WD-001",
      action: AUDIT_ACTIONS.settlementRequestCreated,
      actor: "Analyst",
      role: "analyst",
      timestamp: t1,
      details: "TRX-DEMO-002 withdrawal to exchange omnibus — auto-cleared.",
    },
    {
      id: "AUD-WD-002",
      action: AUDIT_ACTIONS.settlementRequestCreated,
      actor: "Policy Engine",
      role: "admin",
      timestamp: t1,
      details: "TRX-DEMO-002 settled via Fireblocks.",
    },
    {
      id: "AUD-WD-003",
      action: AUDIT_ACTIONS.settlementRequestCreated,
      actor: "Analyst",
      role: "analyst",
      timestamp: t2,
      details: "TRX-DEMO-001 withdrawal to external venue submitted.",
    },
    {
      id: "AUD-WD-004",
      action: AUDIT_ACTIONS.policyWorkflowEvaluated,
      actor: "Policy Engine",
      role: "admin",
      timestamp: t2,
      details: "TRX-DEMO-001 flagged — destination not on approved venue list.",
    },
    {
      id: "AUD-WD-005",
      action: AUDIT_ACTIONS.authorizationSubmitted,
      actor: "Analyst",
      role: "analyst",
      timestamp: t2,
      details: "TRX-DEMO-001 held for trading desk manager review.",
    },
  ],
  vaultBalances: [],
  walkthrough: [
    {
      step: 1,
      title: "Desk view — what’s moving",
      detail: "One withdrawal cleared to omnibus; one exception waiting on a new venue wallet.",
      href: "/demo",
    },
    {
      step: 2,
      title: "Review withdrawal in queue",
      detail: "Counterparty risk check before assets leave the omnibus account.",
      href: "/demo/approvals",
    },
    {
      step: 3,
      title: "Approve — Fireblocks broadcasts",
      detail: "Manager sign-off releases Fireblocks to sign and send on-chain.",
      href: "/demo/approvals",
    },
    {
      step: 4,
      title: "Full desk audit log",
      detail: "Every withdrawal decision recorded with Fireblocks settlement proof.",
      href: "/demo/audit",
    },
  ],
};

const gasReadinessScenario: DemoScenario = {
  blueprintId: "gas-readiness",
  headline: "Settlement held — Treasury Main gas below threshold",
  queueSummary:
    "A Sepolia settlement is staged and policy-cleared, but Treasury Main gas (Sepolia ETH) is below the release threshold. Authorization is gated until gas readiness is confirmed.",
  batchLabel: "1 gated on gas · 1 released after top-up",
  transfers: [
    {
      id: "TRX-DEMO-001",
      asset: "ETH_TEST5",
      amount: 0.015,
      destination: fireblocksDemoDestination.address,
      destinationLabel: "Acme Liquidity LLC — settlement wallet",
      reason: "Settlement staged — awaiting Treasury Main gas readiness",
      settlementRail: "Ethereum Sepolia",
      policyTrigger: "Gas readiness below release threshold",
      requiredApprover: "Treasury Manager",
      status: "PENDING_APPROVAL",
      riskLevel: "medium",
      requiresApproval: true,
      createdBy: "Analyst",
      createdByRole: "analyst",
      createdAt: t2,
      updatedAt: t2,
    },
    {
      id: "TRX-DEMO-002",
      asset: "ETH_TEST5",
      amount: 0.004,
      destination: destinationPresets[1].address,
      destinationLabel: destinationPresets[1].label,
      reason: "Settlement released after gas top-up confirmed",
      settlementRail: "Ethereum Sepolia",
      status: "SETTLED",
      riskLevel: "low",
      requiresApproval: false,
      createdBy: "Treasury Manager",
      createdByRole: "treasury_manager",
      fireblocksStatus: "COMPLETED",
      createdAt: t1,
      updatedAt: t1,
    },
  ],
  auditLog: [
    {
      id: "AUD-GAS-001",
      action: AUDIT_ACTIONS.settlementInitiated,
      actor: "Analyst",
      role: "analyst",
      timestamp: t1,
      details: "TRX-DEMO-002 staged for settlement on Ethereum Sepolia.",
    },
    {
      id: "AUD-GAS-002",
      action: AUDIT_ACTIONS.webhookStatusUpdated,
      actor: "Gas Monitor",
      role: "admin",
      timestamp: t1,
      details: "Treasury Main gas confirmed above threshold — TRX-DEMO-002 cleared for release.",
    },
    {
      id: "AUD-GAS-003",
      action: AUDIT_ACTIONS.settlementCompleted,
      actor: "Fireblocks",
      role: "admin",
      timestamp: t1,
      details: "TRX-DEMO-002 settled via Fireblocks custody.",
    },
    {
      id: "AUD-GAS-004",
      action: AUDIT_ACTIONS.settlementInitiated,
      actor: "Analyst",
      role: "analyst",
      timestamp: t2,
      details: "TRX-DEMO-001 staged — settlement to Acme Liquidity LLC.",
    },
    {
      id: "AUD-GAS-005",
      action: AUDIT_ACTIONS.policyEvaluated,
      actor: "Gas Monitor",
      role: "admin",
      timestamp: t2,
      details:
        "Treasury Main gas below release threshold — TRX-DEMO-001 gated pending gas readiness.",
    },
    {
      id: "AUD-GAS-006",
      action: AUDIT_ACTIONS.authorizationQueued,
      actor: "Policy Engine",
      role: "admin",
      timestamp: t2,
      details: "TRX-DEMO-001 held for Treasury Manager gas-readiness confirmation.",
    },
  ],
  vaultBalances: [],
  walkthrough: [
    {
      step: 1,
      title: "Funding posture dashboard",
      detail: "See Treasury Main gas against the release threshold before anything settles.",
      href: "/demo",
    },
    {
      step: 2,
      title: "Settlement gated on gas",
      detail: "A staged settlement is held because Sepolia ETH gas is below threshold.",
      href: "/demo/approvals",
    },
    {
      step: 3,
      title: "Confirm gas readiness & release",
      detail: "Manager confirms gas top-up — Fireblocks signs and settles.",
      href: "/demo/approvals",
    },
    {
      step: 4,
      title: "Gas + settlement audit",
      detail: "Funding checks and release decisions recorded alongside settlement proof.",
      href: "/demo/audit",
    },
  ],
};

const multiChainScenario: DemoScenario = {
  blueprintId: "multi-chain-settlement",
  headline: "Cross-rail settlement batch — unified authorization",
  queueSummary:
    "A coordinated settlement spans multiple rails. Each leg shares one authorization and custody policy; the manager releases the batch and Fireblocks signs per rail.",
  batchLabel: "2 rails pending · 1 leg settled",
  transfers: [
    {
      id: "TRX-DEMO-001",
      asset: "ETH_TEST5",
      amount: 0.01,
      destination: fireblocksDemoDestination.address,
      destinationLabel: "Counterparty — Ethereum leg",
      reason: "Multi-chain settlement — Ethereum Sepolia leg",
      settlementRail: "Ethereum Sepolia",
      policyTrigger: "Cross-rail batch authorization",
      requiredApprover: "Treasury Manager",
      status: "PENDING_APPROVAL",
      riskLevel: "high",
      requiresApproval: true,
      createdBy: "Analyst",
      createdByRole: "analyst",
      createdAt: t2,
      updatedAt: t2,
    },
    {
      id: "TRX-DEMO-002",
      asset: "AMOY_POLYGON_TEST",
      amount: 12.5,
      destination: destinationPresets[1].address,
      destinationLabel: "Counterparty — Polygon leg",
      reason: "Multi-chain settlement — Polygon Amoy leg",
      settlementRail: "Polygon Amoy",
      policyTrigger: "Cross-rail batch authorization",
      requiredApprover: "Treasury Manager",
      status: "PENDING_APPROVAL",
      riskLevel: "high",
      requiresApproval: true,
      createdBy: "Analyst",
      createdByRole: "analyst",
      createdAt: t2,
      updatedAt: t2,
    },
    {
      id: "TRX-DEMO-003",
      asset: "ETH_TEST5",
      amount: 0.006,
      destination: destinationPresets[0].address,
      destinationLabel: destinationPresets[0].label,
      reason: "Multi-chain settlement — Ethereum leg (settled)",
      settlementRail: "Ethereum Sepolia",
      status: "SETTLED",
      riskLevel: "low",
      requiresApproval: false,
      createdBy: "Analyst",
      createdByRole: "analyst",
      fireblocksStatus: "COMPLETED",
      createdAt: t1,
      updatedAt: t1,
    },
  ],
  auditLog: [
    {
      id: "AUD-MC-001",
      action: AUDIT_ACTIONS.settlementInitiated,
      actor: "Analyst",
      role: "analyst",
      timestamp: t1,
      details: "TRX-DEMO-003 settled on Ethereum Sepolia — first leg of the batch.",
    },
    {
      id: "AUD-MC-002",
      action: AUDIT_ACTIONS.settlementCompleted,
      actor: "Fireblocks",
      role: "admin",
      timestamp: t1,
      details: "TRX-DEMO-003 confirmed on-chain via Fireblocks custody.",
    },
    {
      id: "AUD-MC-003",
      action: AUDIT_ACTIONS.settlementInitiated,
      actor: "Analyst",
      role: "analyst",
      timestamp: t2,
      details: "TRX-DEMO-001 / TRX-DEMO-002 initiated across Ethereum Sepolia and Polygon Amoy.",
    },
    {
      id: "AUD-MC-004",
      action: AUDIT_ACTIONS.policyEvaluated,
      actor: "Policy Engine",
      role: "admin",
      timestamp: t2,
      details: "Cross-rail batch requires unified authorization before any leg broadcasts.",
    },
    {
      id: "AUD-MC-005",
      action: AUDIT_ACTIONS.authorizationQueued,
      actor: "Policy Engine",
      role: "admin",
      timestamp: t2,
      details: "Both legs routed to the Treasury Manager authorization queue.",
    },
  ],
  vaultBalances: [],
  walkthrough: [
    {
      step: 1,
      title: "Cross-rail settlement view",
      detail: "One batch, multiple rails — see Ethereum and Polygon legs in a single queue.",
      href: "/demo",
    },
    {
      step: 2,
      title: "Unified authorization",
      detail: "Both legs share one authorization and custody policy before release.",
      href: "/demo/approvals",
    },
    {
      step: 3,
      title: "Fireblocks signs per rail",
      detail: "On approval, Fireblocks signs and broadcasts each leg on its own rail.",
      href: "/demo/approvals",
    },
    {
      step: 4,
      title: "Unified audit trail",
      detail: "Every rail’s lifecycle rolls up into one settlement audit record.",
      href: "/demo/audit",
    },
  ],
};

const webhookLifecycleScenario: DemoScenario = {
  blueprintId: "webhook-lifecycle",
  headline: "Settlement in flight — webhook lifecycle tracking",
  queueSummary:
    "An authorized settlement is progressing through Fireblocks signing and on-chain confirmation. Webhook events advance the audit state from broadcast to confirmed.",
  batchLabel: "1 in flight · 1 confirmed complete",
  transfers: [
    {
      id: "TRX-DEMO-001",
      asset: "ETH_TEST5",
      amount: 0.009,
      destination: fireblocksDemoDestination.address,
      destinationLabel: "Acme Liquidity LLC — settlement wallet",
      reason: "Settlement broadcasting — awaiting on-chain confirmation",
      settlementRail: "Ethereum Sepolia",
      status: "APPROVED",
      riskLevel: "medium",
      requiresApproval: true,
      createdBy: "Analyst",
      createdByRole: "analyst",
      reviewedBy: "Treasury Manager",
      reviewedByRole: "treasury_manager",
      fireblocksTxId: "fb-tx-7c41a9",
      fireblocksStatus: "BROADCASTING",
      createdAt: t1,
      updatedAt: t3,
    },
    {
      id: "TRX-DEMO-002",
      asset: "ETH_TEST5",
      amount: 0.005,
      destination: destinationPresets[1].address,
      destinationLabel: destinationPresets[1].label,
      reason: "Settlement confirmed — webhook lifecycle complete",
      settlementRail: "Ethereum Sepolia",
      status: "SETTLED",
      riskLevel: "low",
      requiresApproval: false,
      createdBy: "Analyst",
      createdByRole: "analyst",
      reviewedBy: "Treasury Manager",
      reviewedByRole: "treasury_manager",
      fireblocksTxId: "fb-tx-3b90d2",
      fireblocksStatus: "COMPLETED",
      createdAt: t1,
      updatedAt: t2,
    },
  ],
  auditLog: [
    {
      id: "AUD-WH-001",
      action: AUDIT_ACTIONS.managerAuthorized,
      actor: "Treasury Manager",
      role: "treasury_manager",
      timestamp: t1,
      details: "TRX-DEMO-002 authorized — released to Fireblocks for signing.",
    },
    {
      id: "AUD-WH-002",
      action: AUDIT_ACTIONS.fireblocksTransactionCreated,
      actor: "Fireblocks",
      role: "admin",
      timestamp: t1,
      details: "fb-tx-3b90d2 created — submitted to Ethereum Sepolia.",
    },
    {
      id: "AUD-WH-003",
      action: AUDIT_ACTIONS.settlementCompleted,
      actor: "Webhook",
      role: "admin",
      timestamp: t2,
      details: "fb-tx-3b90d2 webhook COMPLETED — TRX-DEMO-002 settled on-chain.",
    },
    {
      id: "AUD-WH-004",
      action: AUDIT_ACTIONS.managerAuthorized,
      actor: "Treasury Manager",
      role: "treasury_manager",
      timestamp: t1,
      details: "TRX-DEMO-001 authorized — released to Fireblocks for signing.",
    },
    {
      id: "AUD-WH-005",
      action: AUDIT_ACTIONS.fireblocksTransactionCreated,
      actor: "Fireblocks",
      role: "admin",
      timestamp: t3,
      details: "fb-tx-7c41a9 created — broadcasting to Ethereum Sepolia.",
    },
    {
      id: "AUD-WH-006",
      action: AUDIT_ACTIONS.webhookStatusUpdated,
      actor: "Webhook",
      role: "admin",
      timestamp: t3,
      details: "fb-tx-7c41a9 webhook BROADCASTING — awaiting terminal confirmation.",
    },
  ],
  vaultBalances: [],
  walkthrough: [
    {
      step: 1,
      title: "Lifecycle dashboard",
      detail: "One settlement in flight, one confirmed — driven by Fireblocks webhook events.",
      href: "/demo",
    },
    {
      step: 2,
      title: "Authorize and release",
      detail: "Manager authorization hands the transaction to Fireblocks for signing.",
      href: "/demo/approvals",
    },
    {
      step: 3,
      title: "Webhook advances state",
      detail: "Broadcast → confirming → completed events update the settlement automatically.",
      href: "/demo/approvals",
    },
    {
      step: 4,
      title: "Event-sourced audit",
      detail: "Every webhook transition is recorded with its Fireblocks transaction ID.",
      href: "/demo/audit",
    },
  ],
};

const scenarios: Record<string, DemoScenario> = {
  "stablecoin-payouts": stablecoinScenario,
  "treasury-approval": treasuryScenario,
  "exchange-withdrawal-review": withdrawalScenario,
  "gas-readiness": gasReadinessScenario,
  "multi-chain-settlement": multiChainScenario,
  "webhook-lifecycle": webhookLifecycleScenario,
};

export function getDemoScenario(blueprintId: string | null): DemoScenario {
  const id = blueprintId ?? "stablecoin-payouts";
  const scenario = scenarios[id] ?? stablecoinScenario;
  return {
    ...scenario,
    vaultBalances: applyVaultLedger(scenario.vaultBalances, scenario.transfers),
  };
}

export function applyDemoScenario(
  state: {
    transfers: Transfer[];
    auditLog: AuditEvent[];
    vaultBalances: VaultBalance[];
  },
  blueprintId: string | null,
): {
  transfers: Transfer[];
  auditLog: AuditEvent[];
  vaultBalances: VaultBalance[];
} {
  const scenario = getDemoScenario(blueprintId);
  return {
    transfers: scenario.transfers,
    auditLog: scenario.auditLog,
    vaultBalances: scenario.vaultBalances,
  };
}
