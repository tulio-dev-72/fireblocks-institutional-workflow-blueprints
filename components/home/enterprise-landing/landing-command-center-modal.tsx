"use client";

import { useEffect } from "react";

import { Card } from "@/components/ui/primitives";
import type { OperationalInsight } from "@/lib/operations/operational-intelligence";
import { getOperationalInsightCategoryLabel } from "@/lib/operations/operational-intelligence";

const COMMAND_CENTER_URL = "https://fireblocks-trusted-ai-command-cente.vercel.app/";

const severityStyles = {
  info: "border-ops-border bg-ops-surface",
  warning: "border-ops-warning/25 bg-ops-warning-muted/20",
  critical: "border-ops-danger/25 bg-ops-danger-muted/20",
} as const;

type LandingCommandCenterModalProps = {
  open: boolean;
  insights: OperationalInsight[];
  onClose: () => void;
};

export function LandingCommandCenterModal({
  open,
  insights,
  onClose,
}: LandingCommandCenterModalProps) {
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ops-text/40 px-4 py-8 backdrop-blur-sm sm:py-12"
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-center-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl border border-ops-border bg-ops-bg shadow-[var(--ops-shadow-lg)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ops-border/70 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ops-text-dim">
              AI operational intelligence
            </p>
            <h2
              id="command-center-modal-title"
              className="mt-1.5 text-lg font-semibold tracking-tight text-ops-text"
            >
              Institutional operational reasoning
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ops-text-secondary">
              At the authorization moment, each settlement gets an AI Transaction Summary grounded
              in live Fireblocks custody, policy, and funding data. These briefings preview that
              reasoning.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close operational intelligence overview"
            className="-mr-1 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ops-border-subtle bg-ops-surface text-ops-text-secondary shadow-[var(--ops-shadow-sm)] transition hover:border-ops-border hover:bg-ops-overlay hover:text-ops-text"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-6 sm:px-6">
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

          <div className="mt-6 flex flex-col gap-4 border-t border-ops-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-xs leading-relaxed text-ops-text-dim">
              In-app AI summarizes a single settlement at the point of authorization. For
              evidence-backed investigations across treasury operations, settlements, approvals,
              liquidity, and policy enforcement, the Trusted AI Command Center runs governed AI
              reasoning over the same Fireblocks workspace.
            </p>
            <a
              href={COMMAND_CENTER_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-ops-info/30 bg-ops-info-muted/20 px-4 py-2.5 text-sm font-semibold text-ops-info shadow-[var(--ops-shadow-sm)] transition hover:bg-ops-info-muted/35"
            >
              Open the Trusted AI Command Center →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
