"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RoleBadge, LiveBadge } from "@/components/ui/badges";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { RoleSwitcherModal } from "@/components/demo/role-switcher-modal";
import { useAuth } from "@/components/auth/auth-provider";
import { exitSandboxSession } from "@/lib/auth/exit-sandbox-session";
import { useFireblocksConnection } from "@/lib/fireblocks/use-fireblocks-connection";
import { getRoleLabel, useAppStore } from "@/lib/store";
import { getScenarioHint, getScenarioTitle } from "@/data/infrastructure-stories";

const shellMaxWidth = "max-w-lg md:max-w-2xl xl:max-w-4xl";

export function DemoTopBar({
  title,
  subtitle,
  titleHint,
  titleHintLabel,
}: {
  title: string;
  subtitle?: string;
  titleHint?: ReactNode;
  titleHintLabel?: string;
}) {
  const router = useRouter();
  const { isSupabaseAuth, signOut } = useAuth();
  const { effectiveRole, sessionReady, clearRole, actorName, state } = useAppStore();
  const { connected } = useFireblocksConnection();
  const displayRole = sessionReady ? effectiveRole : null;
  const displayName = sessionReady ? actorName : "Loading…";
  const workflowTitle = sessionReady ? getScenarioTitle(state.activeBlueprint) : null;
  const workflowHint = sessionReady ? getScenarioHint(state.activeBlueprint) : null;
  const [switcherOpen, setSwitcherOpen] = useState(false);

  async function handleEndSession() {
    await exitSandboxSession({
      clearRole,
      signOut: isSupabaseAuth ? signOut : undefined,
      router,
      endSession: isSupabaseAuth,
    });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-ops-border bg-ops-surface shadow-[var(--ops-shadow-md)] backdrop-blur-md">
      <div
        className={`mx-auto flex ${shellMaxWidth} flex-col gap-3 px-3 py-3 sm:flex-row sm:items-start sm:justify-between`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ops-text-dim">
              Treasury Control Center
            </p>
            <LiveBadge live={connected} />
          </div>
          {workflowTitle ? (
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-ops-border-subtle bg-ops-overlay/60 px-2 py-0.5 text-[11px] font-semibold text-ops-text-secondary">
                <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ops-text-dim">
                  Workflow
                </span>
                <span className="text-ops-text">{workflowTitle}</span>
              </span>
              {workflowHint ? (
                <InfoTooltip
                  label={`About the ${workflowTitle} workflow`}
                  content={workflowHint}
                  side="bottom"
                  align="start"
                />
              ) : null}
            </div>
          ) : null}
          <div className="mt-1 flex items-center gap-1.5">
            <h1 className="text-lg font-semibold tracking-tight text-ops-text">{title}</h1>
            {titleHint ? (
              <InfoTooltip
                label={titleHintLabel ?? `More about ${title}`}
                content={titleHint}
                side="bottom"
                align="start"
              />
            ) : null}
          </div>
          {subtitle ? (
            <p className="mt-1 text-sm leading-relaxed text-ops-text-secondary">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 sm:flex-col sm:items-end sm:text-right">
          {displayRole ? <RoleBadge role={displayRole} /> : null}
          <p className="text-[11px] font-medium text-ops-text-secondary">{displayName}</p>
          <div className="flex gap-3 sm:flex-col sm:gap-1">
            <button
              type="button"
              onClick={() => setSwitcherOpen(true)}
              className="inline-flex min-h-11 items-center text-[11px] font-medium text-ops-text-secondary hover:text-ops-primary"
            >
              Switch role
            </button>
            <button
              type="button"
              onClick={() => void handleEndSession()}
              className="inline-flex min-h-11 items-center text-[11px] text-ops-text-dim hover:text-ops-text-secondary"
            >
              End session
            </button>
          </div>
        </div>
      </div>
      <RoleSwitcherModal open={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </header>
  );
}

export function DemoRoleSummary() {
  const { effectiveRole } = useAppStore();
  if (!effectiveRole) return null;

  return (
    <p className="text-xs text-ops-text-secondary">
      Signed in as{" "}
      <span className="font-medium text-ops-text">{getRoleLabel(effectiveRole)}</span>
    </p>
  );
}
