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
