import type { UserRole } from "@/lib/types";
import type { WorkflowStepId } from "@/lib/workflow";

/**
 * Every role lands on the Operations dashboard first for orientation, then
 * navigates to their task via the bottom nav (Initiate / Authorize / etc.).
 */
export const ROLE_DESTINATIONS: Record<UserRole, string> = {
  analyst: "/demo",
  treasury_manager: "/demo",
  admin: "/demo",
};

export const ROLE_WORKFLOW_STEPS: Record<UserRole, WorkflowStepId> = {
  analyst: "create",
  treasury_manager: "approval",
  admin: "audit",
};

export function getRoleDestination(role: UserRole): string {
  return ROLE_DESTINATIONS[role];
}

export function getRoleWorkflowStep(role: UserRole): WorkflowStepId {
  return ROLE_WORKFLOW_STEPS[role];
}

export function isKnownAppRoute(path: string): boolean {
  return (
    path === "/" ||
    path.startsWith("/operations") ||
    path.startsWith("/demo") ||
    path.startsWith("/auth")
  );
}
