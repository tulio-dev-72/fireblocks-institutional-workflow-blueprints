"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { SandboxLoginScreen } from "@/components/auth/sandbox-login-screen";
import { Card, SecondaryButton, SectionHeader } from "@/components/ui/primitives";
import {
  ACCESS_PORTAL_TITLE,
  SANDBOX_ACCESS_LABEL,
  SANDBOX_FOOTER_NOTE,
  SANDBOX_ROLES,
} from "@/data/sandbox-roles";
import { launchSandboxRole } from "@/lib/auth/sandbox-login";
import { prepareSandboxSession, resolveSandboxNavigation } from "@/lib/auth/prepare-sandbox-session";
import { trackProductEvent } from "@/lib/analytics";
import { ACCESS_PORTAL } from "@/lib/supabase/routes";
import { useAppStore } from "@/lib/store";
import type { UserRole } from "@/lib/types";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSupabaseAuth, isDemoMode, refreshSession } = useAuth();
  const { setRole, setActiveBlueprint, setWorkflowStep } = useAppStore();
  const [busyRole, setBusyRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestedNext = searchParams.get("next");

  useEffect(() => {
    if (!isSupabaseAuth) {
      router.replace(ACCESS_PORTAL);
    }
  }, [isSupabaseAuth, router]);

  const handleEnterRole = useCallback(
    async (role: UserRole) => {
      setBusyRole(role);
      setError(null);

      try {
        const result = await launchSandboxRole(role, {
          isSupabaseAuth,
          isDemoMode,
          refreshSession,
        });

        if (!result.ok) {
          setError(result.error);
          return;
        }

        trackProductEvent("demo_login", {
          page: "/auth/sign-in",
          role: result.role,
          workflow_type: "sandbox_access",
        });

        prepareSandboxSession(result.role, {
          setRole,
          setActiveBlueprint,
          setWorkflowStep,
        });

        // Keep the "signing in as {role}" screen visible long enough to read.
        await new Promise((resolve) => setTimeout(resolve, 1200));

        router.push(resolveSandboxNavigation(result.role, requestedNext));
        router.refresh();
      } catch (enterError) {
        setError(enterError instanceof Error ? enterError.message : "Unable to enter sandbox.");
      } finally {
        setBusyRole(null);
      }
    },
    [
      isSupabaseAuth,
      isDemoMode,
      refreshSession,
      setRole,
      setActiveBlueprint,
      setWorkflowStep,
      requestedNext,
      router,
    ],
  );

  if (!isSupabaseAuth) {
    return null;
  }

  if (busyRole) {
    return <SandboxLoginScreen role={busyRole} />;
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        label="Institutional access"
        title="Select a role"
        subtitle="Choose a sandbox role to enter the Treasury Control Center. No credentials required."
      />

      <Card variant="elevated">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ops-text-dim">
          {SANDBOX_ACCESS_LABEL}
        </p>

        <div className="mt-4 space-y-2.5">
          {SANDBOX_ROLES.map((entry) => (
            <article
              key={entry.role}
              className="rounded-xl border border-ops-border bg-ops-surface/80 px-4 py-3.5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 text-left">
                  <h3 className="text-sm font-semibold text-ops-text">{entry.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-ops-text-secondary">
                    {entry.description}
                  </p>
                  <p className="mt-1.5 text-[10px] text-ops-text-dim">{entry.responsibility}</p>
                </div>
                <SecondaryButton
                  type="button"
                  className="w-full shrink-0 sm:w-auto sm:min-w-[10rem]"
                  disabled={busyRole !== null}
                  onClick={() => void handleEnterRole(entry.role)}
                >
                  {busyRole === entry.role ? "Entering…" : entry.actionLabel}
                </SecondaryButton>
              </div>
            </article>
          ))}
        </div>

        {error ? <p className="mt-3 text-xs text-ops-danger">{error}</p> : null}
      </Card>

      <p className="text-center text-[11px] leading-relaxed text-ops-text-dim">
        {SANDBOX_FOOTER_NOTE}
      </p>

      <p className="text-center text-xs text-ops-text-secondary">
        <Link href={ACCESS_PORTAL} className="font-medium text-ops-primary hover:underline">
          ← Return to {ACCESS_PORTAL_TITLE}
        </Link>
      </p>
    </div>
  );
}
