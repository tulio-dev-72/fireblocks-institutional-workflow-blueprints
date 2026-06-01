"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import { PRIMARY_BLUEPRINT_ID } from "@/data/primary-scenario";
import { getRoleLabel } from "@/lib/auth/role-labels";
import {
  prepareSandboxSession,
  resolveSandboxNavigation,
} from "@/lib/auth/prepare-sandbox-session";
import { launchSandboxRole } from "@/lib/auth/sandbox-login";
import { useAppStore } from "@/lib/store";
import type { UserRole } from "@/lib/types";

type RoleSwitcherModalProps = {
  open: boolean;
  onClose: () => void;
};

const ROLES: { role: UserRole; description: string }[] = [
  {
    role: "analyst",
    description: "Initiate settlement requests. Cannot authorize queue releases.",
  },
  {
    role: "treasury_manager",
    description: "Review and authorize settlements before Fireblocks custody release.",
  },
  {
    role: "admin",
    description: "Configure policy rules and Fireblocks integration settings.",
  },
];

export function RoleSwitcherModal({ open, onClose }: RoleSwitcherModalProps) {
  const router = useRouter();
  const { isSupabaseAuth, isDemoMode, refreshSession } = useAuth();
  const { effectiveRole, state, setRole, setActiveBlueprint, setWorkflowStep } = useAppStore();
  const activeBlueprint = state.activeBlueprint ?? PRIMARY_BLUEPRINT_ID;

  const [busyRole, setBusyRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  async function handleSwitch(role: UserRole) {
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

      // Preserve the active scenario so the new role lands in the same workflow.
      prepareSandboxSession(
        result.role,
        { setRole, setActiveBlueprint, setWorkflowStep },
        activeBlueprint,
      );

      onClose();
      router.push(resolveSandboxNavigation(result.role));
      router.refresh();
    } catch (switchError) {
      setError(switchError instanceof Error ? switchError.message : "Unable to switch role.");
    } finally {
      setBusyRole(null);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ops-text/40 px-4 py-8 backdrop-blur-sm sm:py-12"
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-switcher-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-ops-border bg-ops-bg shadow-[var(--ops-shadow-lg)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ops-border/70 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ops-text-dim">
              Operational role
            </p>
            <h2
              id="role-switcher-title"
              className="mt-1.5 text-lg font-semibold tracking-tight text-ops-text"
            >
              Switch role
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ops-text-secondary">
              Re-enter the current workflow as a different role. Each role signs into its own
              workspace account, so segregation of duties stays intact.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close role switcher"
            className="-mr-1 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ops-border-subtle bg-ops-surface text-ops-text-secondary shadow-[var(--ops-shadow-sm)] transition hover:border-ops-border hover:bg-ops-overlay hover:text-ops-text"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-2 px-5 py-5">
          {error ? (
            <p className="rounded-lg border border-ops-danger/30 bg-ops-danger/5 px-3 py-2 text-xs text-ops-danger">
              {error}
            </p>
          ) : null}

          {ROLES.map(({ role, description }) => {
            const isCurrent = role === effectiveRole;
            const isBusy = busyRole === role;
            return (
              <button
                key={role}
                type="button"
                disabled={isCurrent || busyRole !== null}
                onClick={() => void handleSwitch(role)}
                className={`flex w-full flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition disabled:cursor-not-allowed ${
                  isCurrent
                    ? "border-ops-primary/40 bg-ops-primary-muted/30 ring-1 ring-ops-primary/20"
                    : "border-ops-border bg-ops-surface hover:border-ops-primary/50 hover:bg-ops-overlay disabled:opacity-60"
                }`}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-ops-text">{getRoleLabel(role)}</span>
                  {isCurrent ? (
                    <span className="inline-flex items-center rounded-md bg-ops-primary-muted px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ops-primary">
                      Current
                    </span>
                  ) : isBusy ? (
                    <span className="text-[10px] font-medium text-ops-text-secondary">
                      Signing in…
                    </span>
                  ) : null}
                </div>
                <span className="text-xs leading-relaxed text-ops-text-secondary">{description}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
