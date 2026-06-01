import type { UserRole } from "@/lib/types";
import { DEMO_ACCOUNTS } from "@/data/demo-accounts";

export type SandboxRoleDefinition = {
  role: UserRole;
  title: string;
  description: string;
  responsibility: string;
  /** How this role relates to the Fireblocks custody boundary (accurate to what's wired). */
  custodyMapping: string;
  actionLabel: string;
};

export const ACCESS_PORTAL_TITLE = "Treasury Control Center";

export const ACCESS_PORTAL_SUBTITLE =
  "Operational governance for institutional stablecoin settlement workflows, powered by Fireblocks infrastructure.";

export const SANDBOX_FOOTER_NOTE =
  "Sandbox environment using Fireblocks test infrastructure and test settlement assets.";

export const SANDBOX_ROLES: SandboxRoleDefinition[] = [
  {
    role: "analyst",
    title: "Treasury Analyst",
    description: "Initiates and reviews settlement requests. No signing or release authority.",
    responsibility: "Settlement request initiation · operational review",
    custodyMapping: "Creates a settlement request in the app — never touches Fireblocks signing.",
    actionLabel: "Enter as Analyst",
  },
  {
    role: "treasury_manager",
    title: "Treasury Manager",
    description:
      "Authorizes settlement requests, releasing them to Fireblocks for MPC signing and on-chain settlement.",
    responsibility: "Authorization queue · custody release",
    custodyMapping: "Approval triggers the real Fireblocks transaction — MPC signs and settles on-chain.",
    actionLabel: "Enter as Manager",
  },
  {
    role: "admin",
    title: "Platform Admin",
    description: "Owns app-level governance: policy thresholds, destination allowlist, and integration state.",
    responsibility: "Policy administration · integration oversight",
    custodyMapping: "Configures the app-level policy and integration that gate every release.",
    actionLabel: "Enter as Admin",
  },
];

const ROLE_TO_ACCOUNT_INDEX: Record<UserRole, number> = {
  analyst: 0,
  treasury_manager: 1,
  admin: 2,
};

export function getSandboxAccountForRole(role: UserRole) {
  const account = DEMO_ACCOUNTS[ROLE_TO_ACCOUNT_INDEX[role]];
  if (!account) {
    throw new Error(`No sandbox account configured for role: ${role}`);
  }
  return account;
}

export const SANDBOX_ACCESS_LABEL = "Institutional role access";
