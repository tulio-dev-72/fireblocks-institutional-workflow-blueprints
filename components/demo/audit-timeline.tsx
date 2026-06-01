import type { AuditEvent } from "@/lib/types";
import { formatOperationalTime } from "@/lib/format";
import { getRoleLabel } from "@/lib/store";

const infrastructureActors = new Set(["Policy Engine", "Fireblocks API", "Fireblocks Webhook"]);

export function AuditTimeline({ events }: { events: AuditEvent[] }) {
  const chronological = [...events].reverse();

  return (
    <div className="relative space-y-0">
      <div className="absolute bottom-2 left-[9px] top-2 w-0.5 bg-ops-border" />
      {chronological.map((event, index) => {
        const isLatest = index === 0;
        const isInfrastructure = infrastructureActors.has(event.actor);

        return (
          <div key={event.id} className="relative pl-7 pb-5 last:pb-0">
            <span
              className={`absolute left-1.5 top-1.5 h-3 w-3 rounded-full border-2 ${
                isLatest
                  ? "border-ops-primary bg-ops-primary"
                  : isInfrastructure
                    ? "border-ops-info bg-ops-info-muted"
                    : "border-ops-primary/40 bg-ops-surface"
              }`}
            />
            <p className="font-mono text-[11px] font-medium tabular-nums text-ops-text-secondary">
              {formatOperationalTime(event.timestamp)}
            </p>
            <h3 className="mt-1 text-sm font-semibold text-ops-text">{event.action}</h3>
            {event.details ? (
              <p className="mt-1 text-xs leading-relaxed text-ops-text-secondary">{event.details}</p>
            ) : null}
            <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-ops-text-dim">
              <span>
                {event.actor}
                {!isInfrastructure ? ` · ${getRoleLabel(event.role)}` : null}
              </span>
              {event.seeded ? (
                <span
                  className="inline-flex items-center rounded bg-ops-overlay px-1 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-ops-text-dim ring-1 ring-ops-border-subtle"
                  title="Pre-populated demo event illustrating the workflow — not recorded from a live action."
                >
                  Seeded
                </span>
              ) : (
                <span
                  className="inline-flex items-center rounded bg-ops-success-muted px-1 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-ops-success ring-1 ring-ops-success/25"
                  title="Recorded live from an action taken in this session."
                >
                  Live
                </span>
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}
