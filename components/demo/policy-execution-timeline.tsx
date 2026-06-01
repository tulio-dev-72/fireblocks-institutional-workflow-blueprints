"use client";

import type { Transfer } from "@/lib/types";
import type { FireblocksWebhookDelivery } from "@/lib/fireblocks/webhook-types";
import { Card, SectionHeader } from "@/components/ui/primitives";
import { FireblocksStatusBadge } from "@/components/ui/badges";
import { getFireblocksStatusLabel, isRealFireblocksTxId } from "@/lib/fireblocks/lifecycle";
import { useWebhookLifecycleSync } from "@/lib/fireblocks/use-webhook-lifecycle-sync";
import { isSupabasePersistenceEnabled } from "@/lib/supabase/persistence";

function formatEventTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function EventRow({ delivery, isLast }: { delivery: FireblocksWebhookDelivery; isLast: boolean }) {
  return (
    <div className="relative flex gap-3">
      {!isLast ? (
        <div className="absolute left-[5px] top-4 h-[calc(100%+0.5rem)] w-px bg-ops-border" aria-hidden />
      ) : null}
      <div className="relative z-10 mt-1 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-ops-info bg-ops-info-muted" />
      <div className="min-w-0 flex-1 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wide text-ops-text-secondary">
            {delivery.event_type}
          </span>
          <span className="font-mono text-[10px] tabular-nums text-ops-text-dim">
            {formatEventTime(delivery.created_at)}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <FireblocksStatusBadge status={delivery.status} />
          <span className="text-[11px] text-ops-text-secondary">
            {getFireblocksStatusLabel(delivery.status)}
          </span>
        </div>
        {delivery.sub_status ? (
          <p className="mt-1 text-[10px] text-ops-text-dim">
            sub-status: <span className="font-mono text-ops-text-secondary">{delivery.sub_status}</span>
          </p>
        ) : null}
        {delivery.signature_valid !== null ? (
          <p className="mt-1 text-[10px] text-ops-text-dim">
            webhook signature:{" "}
            <span className={delivery.signature_valid ? "text-ops-success" : "text-ops-danger"}>
              {delivery.signature_valid ? "verified" : "unverified"}
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function PolicyExecutionTimeline({ transfer }: { transfer: Transfer }) {
  const realTx = isRealFireblocksTxId(transfer.fireblocksTxId);

  const { deliveries } = useWebhookLifecycleSync({
    externalId: transfer.id,
    enabled: realTx && isSupabasePersistenceEnabled(),
  });

  // Endpoint returns newest-first; show chronological for the execution narrative.
  const chronological = [...deliveries].reverse();

  return (
    <Card variant="elevated">
      <SectionHeader
        label="Fireblocks · Policy execution"
        title="Live event stream"
        subtitle="Each entry is a real event Fireblocks delivered as it evaluated this transaction against the policy above and signed via MPC."
        titleHintLabel="What am I looking at?"
        titleHint="These are the actual webhook events Fireblocks sent for this transaction. Each carries a status and a finer sub-status (the precise stage within signing or confirmation), plus a signature flag showing the webhook payload was cryptographically verified as genuinely from Fireblocks."
      />

      {transfer.fireblocksTxId ? (
        <div className="mb-3 flex flex-col gap-0.5 rounded-lg border border-ops-border bg-ops-overlay/50 px-3 py-2 sm:flex-row sm:items-baseline sm:justify-between">
          <span className="text-[11px] font-medium text-ops-text-secondary">Transaction ID</span>
          <span className="break-all font-mono text-[11px] text-ops-text">
            {transfer.fireblocksTxId}
          </span>
        </div>
      ) : null}

      {chronological.length > 0 ? (
        <div className="space-y-0">
          {chronological.map((delivery, index) => (
            <EventRow
              key={delivery.id}
              delivery={delivery}
              isLast={index === chronological.length - 1}
            />
          ))}
        </div>
      ) : realTx ? (
        <div className="rounded-lg border border-ops-border bg-ops-overlay/50 px-3 py-3">
          <div className="flex items-center gap-2">
            {transfer.fireblocksStatus ? (
              <>
                <FireblocksStatusBadge status={transfer.fireblocksStatus} />
                <span className="text-[11px] text-ops-text-secondary">
                  {getFireblocksStatusLabel(transfer.fireblocksStatus)}
                </span>
              </>
            ) : (
              <span className="text-[11px] text-ops-text-secondary">Awaiting Fireblocks events…</span>
            )}
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-ops-text-dim">
            Live webhook deliveries appear here as Fireblocks evaluates and signs the transaction.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-ops-border bg-ops-overlay/30 px-3 py-3">
          <p className="text-[11px] leading-relaxed text-ops-text-secondary">
            Live policy-execution events appear here once a settlement is authorized to Fireblocks.
            Run the workflow as Treasury Manager to release a real transaction and watch the policy
            engine evaluate it in real time.
          </p>
        </div>
      )}
    </Card>
  );
}
