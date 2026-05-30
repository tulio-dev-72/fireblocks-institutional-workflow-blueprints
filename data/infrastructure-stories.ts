export type InfrastructureStory = {
  id: string;
  title: string;
  story: string;
  capability: string;
  tags: string[];
  status: "Operational" | "Sandbox Ready" | "Governed";
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
  },
  {
    id: "treasury-rebalancing",
    title: "Treasury Rebalancing",
    story:
      "Coordinated vault-to-vault movements with segregation of duties — analysts propose, managers authorize, Fireblocks signs.",
    capability: "Dual-control workflow · vault discovery · governed rebalancing",
    tags: ["Treasury", "Dual Control", "Vault Accounts"],
    status: "Sandbox Ready",
  },
  {
    id: "gas-readiness",
    title: "Gas Readiness Automation",
    story:
      "Treasury Main funding posture monitored before authorization — Sepolia ETH gas availability gates settlement release.",
    capability: "Funding status · gas readiness · pre-authorization validation",
    tags: ["Treasury Main", "Sepolia", "Funding"],
    status: "Operational",
  },
  {
    id: "multi-chain-coordination",
    title: "Multi-Chain Settlement Coordination",
    story:
      "Operational orchestration across settlement rails with unified authorization, custody policy, and lifecycle visibility.",
    capability: "Rail selection · custody orchestration · unified audit trail",
    tags: ["Multi-Rail", "Orchestration", "Audit"],
    status: "Sandbox Ready",
  },
  {
    id: "webhook-lifecycle",
    title: "Webhook Lifecycle Orchestration",
    story:
      "Event-driven settlement progression from MPC signing through rail confirmation — webhook and API signals update audit state.",
    capability: "Webhook ingestion · lifecycle sync · terminal completion gating",
    tags: ["Webhooks", "Lifecycle", "Event-Driven"],
    status: "Operational",
  },
];
