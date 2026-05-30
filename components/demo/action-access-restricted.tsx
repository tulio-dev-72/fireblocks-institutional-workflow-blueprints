"use client";

import { AccessRestrictedPanel } from "@/components/demo/access-restricted-panel";
import {
  getActionAccessRestriction,
  type AccessRestrictionDetails,
} from "@/lib/auth/access-restriction";
import type { UserRole } from "@/lib/types";

type ActionAccessRestrictedProps = {
  action:
    | "create_settlement"
    | "authorize_settlement"
    | "manage_governance"
    | "view_audit"
    | "fireblocks_submit"
    | "integration_status";
  requiredRoles: UserRole[];
  currentRole: UserRole | null;
  restriction?: AccessRestrictionDetails;
  returnHref?: string;
  returnLabel?: string;
};

export function ActionAccessRestricted({
  action,
  requiredRoles,
  currentRole,
  restriction,
  returnHref,
  returnLabel,
}: ActionAccessRestrictedProps) {
  const resolvedRestriction =
    restriction ?? getActionAccessRestriction(action, requiredRoles);

  return (
    <AccessRestrictedPanel
      restriction={resolvedRestriction}
      currentRole={currentRole}
      returnHref={returnHref}
      returnLabel={returnLabel}
    />
  );
}
