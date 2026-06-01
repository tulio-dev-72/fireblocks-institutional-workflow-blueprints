"use client";

import { useEffect } from "react";

import { SANDBOX_FOOTER_NOTE, SANDBOX_ROLES } from "@/data/sandbox-roles";

type LandingRolesModalProps = {
  open: boolean;
  onClose: () => void;
};

const ROLE_ACCENT: Record<string, { tag: string; ring: string; chip: string }> = {
  analyst: {
    tag: "Initiates · in-app",
    ring: "border-ops-border-subtle",
    chip: "bg-ops-overlay text-ops-text-secondary ring-1 ring-ops-border-subtle",
  },
  treasury_manager: {
    tag: "Crosses custody boundary",
    ring: "border-ops-info/40 ring-1 ring-ops-info/20",
    chip: "bg-ops-info-muted/40 text-ops-info ring-1 ring-ops-info/30",
  },
  admin: {
    tag: "Governs policy · in-app",
    ring: "border-ops-border-subtle",
    chip: "bg-ops-overlay text-ops-text-secondary ring-1 ring-ops-border-subtle",
  },
};

export function LandingRolesModal({ open, onClose }: LandingRolesModalProps) {
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
      aria-labelledby="roles-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl border border-ops-border bg-ops-bg shadow-[var(--ops-shadow-lg)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ops-border/70 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ops-text-dim">
              Institutional roles
            </p>
            <h2
              id="roles-modal-title"
              className="mt-1.5 text-lg font-semibold tracking-tight text-ops-text"
            >
              Segregation of duties across every workflow
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ops-text-secondary">
              App roles map onto the Fireblocks custody boundary. Only the Treasury Manager&apos;s
              authorization releases a real transaction to Fireblocks for MPC signing — segregation
              of duties from initiation through settlement.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close institutional roles"
            className="-mr-1 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ops-border-subtle bg-ops-surface text-ops-text-secondary shadow-[var(--ops-shadow-sm)] transition hover:border-ops-border hover:bg-ops-overlay hover:text-ops-text"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-6 sm:px-6">
          {/* Custody boundary legend */}
          <div className="mb-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-xl border border-ops-border-subtle bg-ops-surface px-4 py-3 text-[11px] font-medium">
            <span className="inline-flex items-center gap-1.5 text-ops-text-secondary">
              <span className="h-2 w-2 rounded-full bg-ops-text-dim" aria-hidden />
              Application layer · RBAC
            </span>
            <span className="text-ops-text-dim" aria-hidden>
              ───▶
            </span>
            <span className="inline-flex items-center gap-1.5 text-ops-info">
              <span className="h-2 w-2 rounded-full bg-ops-info" aria-hidden />
              Fireblocks MPC custody
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {SANDBOX_ROLES.map((entry, index) => {
              const accent = ROLE_ACCENT[entry.role] ?? ROLE_ACCENT.analyst;
              return (
                <article
                  key={entry.role}
                  className={`flex flex-col rounded-xl border bg-ops-surface px-4 py-4 shadow-[var(--ops-shadow-sm)] ${accent.ring}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-ops-overlay px-1.5 text-[10px] font-bold tabular-nums text-ops-text-secondary ring-1 ring-ops-border-subtle">
                      {index + 1}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${accent.chip}`}
                    >
                      {accent.tag}
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-sm font-semibold text-ops-text">{entry.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ops-text-secondary">
                    {entry.description}
                  </p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.08em] text-ops-text-dim">
                    {entry.responsibility}
                  </p>
                  <p className="mt-3 border-t border-ops-border-subtle pt-2.5 text-[11px] leading-relaxed text-ops-text-secondary">
                    <span className="font-bold uppercase tracking-[0.1em] text-ops-info">
                      Fireblocks ·{" "}
                    </span>
                    {entry.custodyMapping}
                  </p>
                </article>
              );
            })}
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-center text-[11px] leading-relaxed text-ops-text-dim">
            {SANDBOX_FOOTER_NOTE}
          </p>
        </div>
      </div>
    </div>
  );
}
