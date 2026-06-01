/**
 * Read-only mirror of the active Transaction Authorization Policy (TAP) in the
 * connected Fireblocks sandbox workspace.
 *
 * These rules are transcribed from the workspace's live policy
 * (Console → Settings → Transaction policy). They are enforced by Fireblocks at
 * the MPC custody layer on every transaction the app submits — independent of any
 * app-level logic. We mirror them statically here because the Policy Editor API is
 * gated to Admin/Non-Signing-Admin keys and our integration key is an Editor (so it
 * can submit transactions and read status, but cannot read or edit the policy).
 *
 * The "Signer" column reflects who authorizes each rule: "Fireblocks Sandbox" is the
 * workspace's automated sandbox co-signer that signs via MPC; "Initiator" means the
 * submitting identity. In production this is where a human approver on the Fireblocks
 * mobile app would sign.
 */

export type TapRuleAction = "ALLOW" | "BLOCK" | "REQUIRE_APPROVAL";

export type TapRule = {
  order: number;
  initiator: string;
  type: string;
  source: string;
  destination: string;
  signer: string;
  amount: string;
  asset: string;
  action: TapRuleAction;
};

export const FIREBLOCKS_TAP_POLICY_META = {
  workspace: "Fireblocks Sandbox",
  source: "Console → Settings → Transaction policy",
  enforcement:
    "Enforced by Fireblocks at the MPC custody layer on every transaction — top-down, first matching rule wins.",
  mirrorNote:
    "Read-only mirror. Our integration key has Editor rights (submit + read status); policy authoring requires an Admin key.",
} as const;

export const FIREBLOCKS_TAP_POLICY: TapRule[] = [
  {
    order: 1,
    initiator: "Anyone",
    type: "Any (typed transfer)",
    source: "Any external user wallet",
    destination: "Any",
    signer: "Initiator",
    amount: "Any amount / transaction",
    asset: "All",
    action: "ALLOW",
  },
  {
    order: 2,
    initiator: "Anyone",
    type: "Any",
    source: "Any",
    destination: "Any",
    signer: "Fireblocks Sandbox",
    amount: "Any amount / transaction",
    asset: "All",
    action: "ALLOW",
  },
  {
    order: 3,
    initiator: "Anyone",
    type: "Raw / contract call",
    source: "Any",
    destination: "1 / Any",
    signer: "Fireblocks Sandbox",
    amount: "N/A",
    asset: "All",
    action: "ALLOW",
  },
  {
    order: 4,
    initiator: "Anyone",
    type: "Transfer",
    source: "Any",
    destination: "Any",
    signer: "Initiator",
    amount: "Any amount / transaction",
    asset: "All",
    action: "BLOCK",
  },
];

export function getTapActionLabel(action: TapRuleAction): string {
  switch (action) {
    case "ALLOW":
      return "Allow";
    case "BLOCK":
      return "Block";
    case "REQUIRE_APPROVAL":
      return "Require approval";
  }
}
