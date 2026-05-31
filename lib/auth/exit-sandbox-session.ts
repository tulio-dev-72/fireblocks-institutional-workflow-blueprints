"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ACCESS_PORTAL } from "@/lib/supabase/routes";

type ExitSandboxOptions = {
  clearRole: () => void;
  signOut?: () => Promise<void>;
  router: AppRouterInstance;
  endSession?: boolean;
};

/** Clear sandbox role state and return to the institutional access portal. */
export async function exitSandboxSession({
  clearRole,
  signOut,
  router,
  endSession = false,
}: ExitSandboxOptions): Promise<void> {
  clearRole();

  if (endSession && signOut) {
    await signOut();
  }

  // Hard navigation to the portal: guarantees the middleware re-evaluates with
  // the cleared iwb_role cookie and avoids the router.replace()/refresh() race
  // that left the client stuck on "Returning to access portal...".
  if (typeof window !== "undefined") {
    window.location.assign(ACCESS_PORTAL);
    return;
  }

  router.replace(ACCESS_PORTAL);
}
