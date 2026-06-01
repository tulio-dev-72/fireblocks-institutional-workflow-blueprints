"use client";

import { SectionHeader } from "@/components/ui/primitives";
import { INFRASTRUCTURE_STORIES, type ScenarioRoleTier } from "@/data/infrastructure-stories";
import { getRoleLabel, getRoleShortLabel } from "@/lib/auth/role-labels";
import type { UserRole } from "@/lib/types";

const statusStyles = {
  Operational: "bg-ops-success-muted text-ops-success ring-ops-success/25",
  "Sandbox Ready": "bg-ops-info-muted text-ops-info ring-ops-info/25",
  Governed: "bg-ops-warning-muted text-ops-warning ring-ops-warning/25",
} as const;

const roleTierStyles: Record<ScenarioRoleTier, string> = {
  primary:
    "border-transparent bg-ops-primary text-white hover:bg-ops-primary-hover shadow-[var(--ops-shadow-sm)]",
  secondary:
    "border-ops-primary/30 bg-ops-primary-muted text-ops-primary hover:border-ops-primary/50",
  tertiary:
    "border-ops-border-subtle bg-ops-overlay/40 text-ops-text-secondary hover:border-ops-border hover:text-ops-text",
};

type InfrastructureStoriesSectionProps = {
  busyRole: UserRole | null;
  error?: string | null;
  onEnterRole: (role: UserRole) => void;
};

export function InfrastructureStoriesSection({
  busyRole,
  error,
  onEnterRole,
}: InfrastructureStoriesSectionProps) {
  return (
    <section id="settlement-scenarios" className="border-t border-ops-border/70 bg-ops-surface/60">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <SectionHeader
          label="Settlement scenarios"
          title="Governed settlement workflows"
          subtitle="Six institutional scenarios demonstrating differentiated operational capability on Fireblocks custody infrastructure. Enter any scenario as one of its roles."
        />

        {error ? (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-ops-danger/30 bg-ops-danger-muted px-4 py-3 text-sm text-ops-danger"
          >
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {INFRASTRUCTURE_STORIES.map((story) => (
            <article
              key={story.id}
              className="flex h-full flex-col rounded-xl border border-ops-border bg-ops-surface p-5 shadow-[var(--ops-shadow-sm)] ring-1 ring-ops-primary/[0.03] transition hover:border-ops-primary/20 hover:shadow-[var(--ops-shadow-md)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-base font-semibold leading-snug text-ops-text">{story.title}</h3>
                <span
                  className={`inline-flex shrink-0 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] ring-1 ${statusStyles[story.status]}`}
                >
                  {story.status}
                </span>
              </div>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-ops-text-secondary">
                {story.story}
              </p>

              <p className="mt-3 text-[11px] font-medium text-ops-text">{story.capability}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {story.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-ops-border-subtle bg-ops-overlay/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-ops-text-dim"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 border-t border-ops-border-subtle pt-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-ops-text-dim">
                  Run this workflow as
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {story.roles.map((scenarioRole) => {
                    const isBusy = busyRole === scenarioRole.role;
                    const isDisabled = busyRole !== null;
                    const label =
                      scenarioRole.tier === "primary"
                        ? getRoleLabel(scenarioRole.role)
                        : getRoleShortLabel(scenarioRole.role);

                    return (
                      <button
                        key={`${story.id}-${scenarioRole.role}`}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => onEnterRole(scenarioRole.role)}
                        title={`${getRoleLabel(scenarioRole.role)} — ${scenarioRole.action}`}
                        aria-label={`Enter ${story.title} as ${getRoleLabel(scenarioRole.role)} (${scenarioRole.tier} role): ${scenarioRole.action}`}
                        className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${roleTierStyles[scenarioRole.tier]}`}
                      >
                        <span>{isBusy ? "Entering…" : label}</span>
                        {scenarioRole.tier === "primary" && !isBusy ? (
                          <span aria-hidden>→</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
