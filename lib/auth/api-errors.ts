import {
  getActionAccessRestriction,
  isAccessRestrictedPayload,
  type AccessRestrictionDetails,
  type AccessRestrictedPayload,
} from "@/lib/auth/access-restriction";
import type { UserRole } from "@/lib/types";

export class AccessRestrictedError extends Error {
  readonly status = 403;
  readonly code = "ACCESS_RESTRICTED" as const;
  readonly payload: AccessRestrictedPayload;

  constructor(payload: AccessRestrictedPayload) {
    super(payload.error);
    this.name = "AccessRestrictedError";
    this.payload = payload;
  }
}

export async function readApiResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as T & {
    error?: string;
    code?: string;
  };

  if (response.status === 403 && isAccessRestrictedPayload(payload)) {
    throw new AccessRestrictedError(payload);
  }

  if (!response.ok) {
    throw new Error(
      typeof payload === "object" && payload && "error" in payload && payload.error
        ? String(payload.error)
        : "Request failed.",
    );
  }

  return payload;
}

export function getAccessRestrictedMessage(error: unknown): string | null {
  if (error instanceof AccessRestrictedError) {
    return error.message;
  }
  return null;
}

export function getAccessRestrictedDetails(error: unknown): AccessRestrictedPayload | null {
  if (error instanceof AccessRestrictedError) {
    return error.payload;
  }
  return null;
}

export function resolveAccessRestrictionFromError(
  error: unknown,
  action: string,
  fallbackRoles: UserRole[],
): AccessRestrictionDetails | null {
  const payload = getAccessRestrictedDetails(error);
  if (!payload) {
    return null;
  }

  const requiredRoles =
    payload.requiredRoles.length > 0 ? payload.requiredRoles : fallbackRoles;
  const base = getActionAccessRestriction(action, requiredRoles);

  return {
    ...base,
    message: payload.error || base.message,
  };
}

export type MutationFailure = {
  ok: false;
  error: string;
  restriction?: AccessRestrictionDetails;
};

export type MutationSuccess = { ok: true };

export type ApproveRejectResult = MutationSuccess | MutationFailure;
export type PolicyMutationResult = MutationSuccess | MutationFailure;
