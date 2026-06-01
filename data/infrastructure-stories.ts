import type { UserRole } from "@/lib/types";

export type ScenarioRoleTier = "primary" | "secondary" | "tertiary";

export type ScenarioRole = {
  role: UserRole;
  tier: ScenarioRoleTier;
  /** What this role does in THIS scenario (verb-led, scenario-specific). */
  action: string;
};

export type InfrastructureStory = {
  id: string;
  title: string;
  story: string;
  capability: string;
  tags: string[];
  status: "Operational" | "Sandbox Ready" | "Governed";
  /** Ordered primary → tertiary. May contain 1–3 roles. */
  roles: ScenarioRole[];
  blueprintId?: string;
  /** Plain-language explanation of what this workflow demonstrates (info tooltip). */
  workflowHint: string;
};

export const INFRASTRUCTURE_STORIES: InfrastructureStory[] = [
  {
    id: "high-value-stablecoin",
    title: "High-Value Stablecoin Settlement",
    story:
      "Analyst-initiated USDC disbursement with policy thresholds, manager authorization, and MPC custody release through Fireblocks.",
    capability: "Threshold routing · authorization queue · custody boundary enforcement",
    tags: ["Stablecoin", "Policy", "MPC Custody"],
    status: "Operational",
    blueprintId: "stablecoin-payouts",
    workflowHint:
      "Analyst initiates a high-value settlement; policy routes it to a Treasury Manager for authorization before Fireblocks releases from MPC custody. The live transaction settles Sepolia test ETH — the same policy and custody pipeline that governs USDC payouts in production.",
    roles: [
      { role: "analyst", tier: "primary", action: "Initiates the USDC settlement request" },
      {
        role: "treasury_manager",
        tier: "secondary",
        action: "Authorizes and releases to Fireblocks",
      },
      { role: "admin", tier: "tertiary", action: "Owns policy thresholds and audit" },
    ],
  },
  {
    id: "exchange-withdrawal",
    title: "Exchange Withdrawal Governance",
    story:
      "Trading desk withdrawals gated by operational review, counterparty allowlists, and treasury manager release before omnibus broadcast.",
    capability: "Withdrawal risk review · allowlist enforcement · audit-ready approval",
    tags: ["Exchange Ops", "Risk Review", "Allowlist"],
    status: "Governed",
    blueprintId: "exchange-withdrawal-review",
    workflowHint:
      "A trading-desk withdrawal to an external venue is held for review because the destination isn't on the approved allowlist. The manager releases it only after a risk review — demonstrating allowlist enforcement and audit-ready sign-off before assets leave the omnibus account.",
    roles: [
      { role: "analyst", tier: "primary", action: "Submits the withdrawal for review" },
      { role: "treasury_manager", tier: "secondary", action: "Releases after risk review" },
      { role: "admin", tier: "tertiary", action: "Maintains the counterparty allowlist" },
    ],
  },
  {
    id: "treasury-rebalancing",
    title: "Treasury Rebalancing",
    story:
      "Coordinated vault-to-vault movements with segregation of duties — analysts propose, managers authorize, Fireblocks signs.",
    capability: "Dual-control workflow · vault discovery · governed rebalancing",
    tags: ["Treasury", "Dual Control", "Vault Accounts"],
    status: "Sandbox Ready",
    blueprintId: "treasury-approval",
    workflowHint:
      "A vault-to-vault rebalance under dual control: an analyst proposes the movement and a Treasury Manager authorizes it before Fireblocks signs. Demonstrates segregation of duties on internal treasury moves — no single role can both initiate and release.",
    roles: [
      { role: "analyst", tier: "primary", action: "Proposes the vault-to-vault movement" },
      { role: "treasury_manager", tier: "secondary", action: "Authorizes the rebalance" },
    ],
  },
  {
    id: "gas-readiness",
    title: "Gas Readiness Automation",
    story:
      "Treasury Main funding posture monitored before authorization — Sepolia ETH gas availability gates settlement release.",
    capability: "Funding status · gas readiness · pre-authorization validation",
    tags: ["Treasury Main", "Sepolia", "Funding"],
    status: "Operational",
    blueprintId: "gas-readiness",
    workflowHint:
      "A policy-cleared settlement is gated because Treasury Main's Sepolia ETH gas is below the release threshold. The manager confirms gas readiness before release — showing a funding/gas check as a pre-authorization gate so transactions don't fail mid-broadcast.",
    roles: [
      {
        role: "treasury_manager",
        tier: "primary",
        action: "Confirms gas readiness before release",
      },
      { role: "admin", tier: "secondary", action: "Owns funding and gas thresholds" },
    ],
  },
  {
    id: "multi-chain-coordination",
    title: "Multi-Chain Settlement Coordination",
    story:
      "Operational orchestration across settlement rails with unified authorization, custody policy, and lifecycle visibility.",
    capability: "Rail selection · custody orchestration · unified audit trail",
    tags: ["Multi-Rail", "Orchestration", "Audit"],
    status: "Sandbox Ready",
    blueprintId: "multi-chain-settlement",
    workflowHint:
      "A single settlement batch spans multiple rails (Ethereum Sepolia + Polygon Amoy) under one authorization and custody policy. On approval, Fireblocks signs and broadcasts each leg on its own rail, rolling up into one unified audit trail.",
    roles: [
      { role: "analyst", tier: "primary", action: "Initiates the cross-rail settlement" },
      { role: "treasury_manager", tier: "secondary", action: "Authorizes across rails" },
      { role: "admin", tier: "tertiary", action: "Defines custody policy per rail" },
    ],
  },
  {
    id: "webhook-lifecycle",
    title: "Webhook Lifecycle Orchestration",
    story:
      "Event-driven settlement progression from MPC signing through rail confirmation — webhook and API signals update audit state.",
    capability: "Webhook ingestion · lifecycle sync · terminal completion gating",
    tags: ["Webhooks", "Lifecycle", "Event-Driven"],
    status: "Operational",
    blueprintId: "webhook-lifecycle",
    workflowHint:
      "An authorized settlement is tracked event-by-event as Fireblocks webhooks advance it from signing through broadcast to on-chain confirmation. The audit state only reads COMPLETED once the network confirms — no simulated UI progress.",
    roles: [
      {
        role: "treasury_manager",
        tier: "primary",
        action: "Authorizes settlements tracked to completion",
      },
      { role: "admin", tier: "secondary", action: "Owns webhook and audit configuration" },
    ],
  },
];
