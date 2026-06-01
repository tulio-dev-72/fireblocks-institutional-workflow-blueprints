"use client";

import { Card, SectionHeader } from "@/components/ui/primitives";
import type { OperationalInsight } from "@/lib/operations/operational-intelligence";
import { getOperationalInsightCategoryLabel } from "@/lib/operations/operational-intelligence";

const severityStyles = {
  info: "border-ops-border bg-ops-surface",
  warning: "border-ops-warning/25 bg-ops-warning-muted/20",
  critical: "border-ops-danger/25 bg-ops-danger-muted/20",
} as const;

const COMMAND_CENTER_URL = "https://fireblocks-trusted-ai-command-cente.vercel.app/";

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
          subtitle="At the authorization moment, each settlement gets an AI Transaction Summary grounded in live Fireblocks custody, policy, and funding data. The briefings below preview that reasoning."
          action={
            <a
              href={COMMAND_CENTER_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-ops-info/30 bg-ops-info-muted/20 px-3 py-2 text-xs font-semibold text-ops-info transition hover:bg-ops-info-muted/35"
            >
              Open the Trusted AI Command Center →
            </a>
          }
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
          In-app AI summarizes a single settlement at the point of authorization. For evidence-backed
          investigations across treasury operations, settlements, approvals, liquidity, and policy
          enforcement, the Trusted AI Command Center runs governed AI reasoning over the same
          Fireblocks workspace.
        </p>
      </div>
    </section>
  );
}
