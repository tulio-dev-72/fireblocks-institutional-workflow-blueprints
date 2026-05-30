import { AUDIT_ACTIONS } from "@/lib/audit";
import { PRIMARY_DEMO_TIMES, PRIMARY_SETTLEMENT } from "@/data/primary-scenario";
import type { AuditEvent, Transfer } from "@/lib/types";

import { generateOperationalIntelligence } from "./operational-intelligence";
import { computeAuthorizationMetrics, computeOperationalRiskSnapshot } from "./metrics";
import type { FireblocksTreasuryState } from "@/lib/fireblocks/types";
import { OFFLINE_TREASURY_STATE } from "@/lib/fireblocks/types";
import { countTransfersByLifecycleStage, resolveTransferLifecycleStage } from "./lifecycle-timeline";

const PREVIEW_TRANSFER: Transfer = {
  id: "TRX-PREVIEW-001",
  asset: PRIMARY_SETTLEMENT.asset,
  amount: PRIMARY_SETTLEMENT.amount,
  destination: PRIMARY_SETTLEMENT.counterpartyAddress,
  destinationLabel: PRIMARY_SETTLEMENT.counterparty,
  reason: PRIMARY_SETTLEMENT.reason,
  sourceVault: PRIMARY_SETTLEMENT.sourceVault,
  settlementRail: PRIMARY_SETTLEMENT.settlementRail,
  counterparty: PRIMARY_SETTLEMENT.counterparty,
  policyTrigger: PRIMARY_SETTLEMENT.policyTrigger,
  requiredApprover: PRIMARY_SETTLEMENT.requiredApprover,
  status: "PENDING_APPROVAL",
  riskLevel: "medium",
  requiresApproval: true,
  createdBy: "Treasury Analyst",
  createdByRole: "analyst",
  fireblocksStatus: "PENDING_SIGNATURE",
  createdAt: PRIMARY_DEMO_TIMES.initiated,
  updatedAt: PRIMARY_DEMO_TIMES.policyEvaluated,
};

const PREVIEW_AUDIT: AuditEvent[] = [
  {
    id: "AUD-P1",
    action: AUDIT_ACTIONS.settlementInitiated,
    actor: "Treasury Analyst",
    role: "analyst",
    timestamp: PRIMARY_DEMO_TIMES.initiated,
    details: `${PREVIEW_TRANSFER.id} initiated for ${PRIMARY_SETTLEMENT.counterparty}.`,
  },
  {
    id: "AUD-P2",
    action: AUDIT_ACTIONS.policyEvaluated,
    actor: "Policy Engine",
    role: "admin",
    timestamp: PRIMARY_DEMO_TIMES.policyEvaluated,
    details: `${PRIMARY_SETTLEMENT.policyTrigger} triggered — manager authorization required.`,
  },
  {
    id: "AUD-P3",
    action: AUDIT_ACTIONS.webhookStatusUpdated,
    actor: "Fireblocks Webhook",
    role: "admin",
    timestamp: PRIMARY_DEMO_TIMES.webhookPending,
    details: "PENDING_SIGNATURE — MPC custody signing in progress.",
  },
];

const PREVIEW_WEBHOOK_EVENTS = [
  {
    id: "wh-1",
    externalId: PREVIEW_TRANSFER.id,
    status: "PENDING_SIGNATURE",
    eventType: "TRANSACTION_STATUS_UPDATED",
    time: PRIMARY_DEMO_TIMES.webhookPending,
  },
  {
    id: "wh-2",
    externalId: PREVIEW_TRANSFER.id,
    status: "CONFIRMING",
    eventType: "TRANSACTION_STATUS_UPDATED",
    time: PRIMARY_DEMO_TIMES.webhookConfirming,
  },
];

export function buildLandingPreviewSnapshot(treasury: FireblocksTreasuryState) {
  const transfers = [PREVIEW_TRANSFER];
  const policy = {
    approvalThreshold: 10000,
    whitelistedAddresses: [PRIMARY_SETTLEMENT.counterpartyAddress],
  };

  const metrics = computeAuthorizationMetrics({
    transfers,
    auditLog: PREVIEW_AUDIT,
    webhookSummary: { total: 12, processed: 11, failed: 0, ignored: 1 },
  });

  const risk = computeOperationalRiskSnapshot({
    transfers,
    policy,
    treasury,
    lastTransferId: PREVIEW_TRANSFER.id,
  });

  const insights = generateOperationalIntelligence({
    transfers,
    auditLog: PREVIEW_AUDIT,
    policy,
    lastTransferId: PREVIEW_TRANSFER.id,
    fireblocksConnected: treasury.integrationStatus === "connected",
    metrics,
    risk,
    webhookSummary: { total: 12, processed: 11, failed: 0, ignored: 1 },
  });

  return {
    transfer: PREVIEW_TRANSFER,
    auditEvents: PREVIEW_AUDIT,
    webhookEvents: PREVIEW_WEBHOOK_EVENTS,
    metrics,
    risk,
    insights,
    stageCounts: countTransfersByLifecycleStage(transfers),
    activeStage: resolveTransferLifecycleStage(PREVIEW_TRANSFER),
  };
}

export function getDefaultLandingTreasury(): FireblocksTreasuryState {
  return OFFLINE_TREASURY_STATE;
}

export type LandingPreviewSnapshot = ReturnType<typeof buildLandingPreviewSnapshot>;
