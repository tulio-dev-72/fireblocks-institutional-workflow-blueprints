"use client";

import { GhostButton, SectionHeader } from "@/components/ui/primitives";
import { INFRASTRUCTURE_STORIES } from "@/data/infrastructure-stories";

const statusStyles = {
  Operational: "bg-ops-success-muted text-ops-success ring-ops-success/25",
  "Sandbox Ready": "bg-ops-info-muted text-ops-info ring-ops-info/25",
  Governed: "bg-ops-warning-muted text-ops-warning ring-ops-warning/25",
} as const;

type InfrastructureStoriesSectionProps = {
  onExploreWorkflow: () => void;
};

export function InfrastructureStoriesSection({
  onExploreWorkflow,
}: InfrastructureStoriesSectionProps) {
  return (
    <section id="infrastructure-stories" className="border-t border-ops-border/70 bg-ops-surface/60">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <SectionHeader
          label="Operational infrastructure stories"
          title="Governed settlement workflows"
          subtitle="Six institutional scenarios demonstrating differentiated operational capability on Fireblocks custody infrastructure."
        />

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
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-ops-text-secondary">
            Run the live stablecoin settlement workflow end-to-end in the sandbox.
          </p>
          <GhostButton type="button" className="px-6" onClick={onExploreWorkflow}>
            Launch the operational sandbox →
          </GhostButton>
        </div>
      </div>
    </section>
  );
}
