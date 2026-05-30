"use client";

import { SettlementLifecycleTimeline } from "@/components/demo/settlement-lifecycle-timeline";
import { Card, SectionHeader, StatTile } from "@/components/ui/primitives";
import { LiveBadge } from "@/components/ui/badges";
import type { LandingPreviewSnapshot } from "@/lib/operations/landing-preview";
import type { InfrastructureStatusItem } from "@/lib/fireblocks/infrastructure-status";
import { getOperationalInsightCategoryLabel } from "@/lib/operations/operational-intelligence";

type LiveOperationsPreviewProps = {
  preview: LandingPreviewSnapshot;
  infrastructureItems: InfrastructureStatusItem[];
  connected: boolean;
};

function formatAuditTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function LiveOperationsPreview({
  preview,
  infrastructureItems,
  connected,
}: LiveOperationsPreviewProps) {
  return (
    <section className="border-t border-ops-border/70 bg-ops-bg">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionHeader
            label="Live operational preview"
            title="Event-driven control center"
            subtitle="Representative settlement signals combined with live Fireblocks infrastructure state — the same operational panels available inside the sandbox."
          />
          <LiveBadge live={connected} />
        </div>

        <div className="grid gap-4 xl:grid-cols-12">
          <div className="space-y-4 xl:col-span-7">
            <SettlementLifecycleTimeline
              activeStage={preview.activeStage}
              stageCounts={preview.stageCounts}
              focusTransfer={preview.transfer}
            />

            <Card variant="surface">
              <SectionHeader
                label="Authorization"
                title="Pending authorization queue"
                subtitle="Settlement awaiting Treasury Manager release before MPC custody boundary."
              />
              <div className="rounded-lg border border-ops-border-subtle bg-ops-overlay/30 px-3 py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-ops-text">{preview.transfer.id}</p>
                    <p className="mt-1 text-xs text-ops-text-secondary">
                      {preview.transfer.destinationLabel} · {preview.transfer.amount}{" "}
                      {preview.transfer.asset}
                    </p>
                  </div>
                  <span className="rounded-md bg-ops-warning-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ops-warning ring-1 ring-ops-warning/30">
                    Pending authorization
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-ops-text-dim">{preview.transfer.reason}</p>
              </div>
            </Card>
          </div>

          <div className="space-y-4 xl:col-span-5">
            <div className="grid grid-cols-2 gap-2">
              <StatTile label="Pending" value={preview.metrics.pendingAuthorizations} accent />
              <StatTile label="Webhook success" value={preview.metrics.webhookSuccessRate} />
            </div>

            <Card variant="accent">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ops-text-dim">
                Webhook events
              </p>
              <div className="mt-3 space-y-2">
                {preview.webhookEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-lg border border-ops-border-subtle bg-ops-surface/80 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-[10px] text-ops-text">{event.externalId}</p>
                      <span className="text-[10px] tabular-nums text-ops-text-dim">
                        {formatAuditTime(event.time)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-ops-info">
                      {event.status.replaceAll("_", " ")}
                    </p>
                    <p className="mt-0.5 text-[10px] text-ops-text-dim">{event.eventType}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="surface">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ops-text-dim">
                Fireblocks integration
              </p>
              <div className="mt-3 space-y-2">
                {infrastructureItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-2 rounded-md border border-ops-border-subtle bg-ops-overlay/35 px-2.5 py-2"
                  >
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        item.active ? "bg-ops-success" : "bg-ops-text-dim/40"
                      }`}
                      aria-hidden
                    />
                    <div>
                      <p className="text-xs font-semibold text-ops-text">{item.label}</p>
                      <p className="mt-0.5 text-[10px] leading-relaxed text-ops-text-secondary">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="ghost">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ops-text-dim">
                Audit timeline
              </p>
              <div className="mt-3 space-y-2">
                {preview.auditEvents.map((event) => (
                  <div key={event.id} className="border-l-2 border-ops-primary/25 pl-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-ops-text-dim">
                      {formatAuditTime(event.timestamp)}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-ops-text">{event.action}</p>
                    <p className="mt-0.5 text-[11px] text-ops-text-secondary">{event.details}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
