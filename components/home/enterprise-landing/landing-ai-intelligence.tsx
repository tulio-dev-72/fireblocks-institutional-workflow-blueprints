"use client";

import { Card, SectionHeader } from "@/components/ui/primitives";
import type { OperationalInsight } from "@/lib/operations/operational-intelligence";
import { getOperationalInsightCategoryLabel } from "@/lib/operations/operational-intelligence";

const severityStyles = {
  info: "border-ops-border bg-ops-surface",
  warning: "border-ops-warning/25 bg-ops-warning-muted/20",
  critical: "border-ops-danger/25 bg-ops-danger-muted/20",
} as const;

type LandingAiIntelligenceProps = {
  insights: OperationalInsight[];
};

export function LandingAiIntelligence({ insights }: LandingAiIntelligenceProps) {
  return (
    <section className="border-t border-ops-border/70 bg-ops-surface/70">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <SectionHeader
          label="AI operational intelligence"
          title="Institutional operational reasoning"
          subtitle="Rule-based operational briefings derived from workflow posture, policy signals, and infrastructure evidence — not speculative analytics or chatbot UX."
        />

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {insights.map((insight) => (
            <Card
              key={insight.id}
              variant="elevated"
              className={`${severityStyles[insight.severity]} !p-4 sm:!p-5`}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ops-text-dim">
                {getOperationalInsightCategoryLabel(insight.category)}
              </p>
              <h3 className="mt-2 text-base font-semibold text-ops-text">{insight.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ops-text-secondary">{insight.body}</p>
            </Card>
          ))}
        </div>

        <p className="mt-6 max-w-3xl text-xs leading-relaxed text-ops-text-dim">
          Operational intelligence summarizes authorization queue depth, counterparty risk, funding
          readiness, webhook delivery health, and lifecycle position using the same engine that
          powers the Treasury Control Center dashboard.
        </p>
      </div>
    </section>
  );
}
