"use client";

import { Card, SectionHeader, StatTile } from "@/components/ui/primitives";
import type { AuthorizationMetrics } from "@/lib/operations/metrics";

type AuthorizationMetricsPanelProps = {
  metrics: AuthorizationMetrics;
};

export function AuthorizationMetricsPanel({ metrics }: AuthorizationMetricsPanelProps) {
  return (
    <Card variant="surface">
      <SectionHeader
        label="Authorization metrics"
        title="Operational throughput"
        subtitle="Metrics computed from workflow state, audit timestamps, and webhook delivery logs — not simulated analytics."
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <StatTile
          label="Pending authorizations"
          value={metrics.pendingAuthorizations}
          accent
          hintLabel="What is Pending authorizations?"
          hint="How many settlements are currently held in the queue waiting for a Treasury Manager to authorize release."
        />
        <StatTile
          label="Average approval time"
          value={metrics.averageApprovalTime}
          hintLabel="What is Average approval time?"
          hint="The mean elapsed time between a settlement being created and authorized, computed from audit-log timestamps. Shows “—” until at least one settlement has been authorized in-session."
        />
        <StatTile
          label="High-risk settlements"
          value={metrics.highRiskSettlements}
          hintLabel="What is High-risk settlements?"
          hint="Count of settlements flagged high-risk by the policy engine — typically a destination outside the approved allowlist or an amount over threshold. These cannot auto-clear."
        />
        <StatTile
          label="Webhook success rate"
          value={metrics.webhookSuccessRate}
          hintLabel="What is Webhook success rate?"
          hint="Share of Fireblocks webhook deliveries this app processed successfully. Computed from real delivery logs; shows “—” until Fireblocks has sent at least one event."
        />
      </div>
    </Card>
  );
}
