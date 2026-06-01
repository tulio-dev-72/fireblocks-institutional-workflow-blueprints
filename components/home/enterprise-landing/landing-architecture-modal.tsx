"use client";

import { useEffect } from "react";

import { InfrastructureOverview } from "@/components/auth/infrastructure-overview";

const ARCHITECTURE_LAYERS = [
  {
    layer: "Operational Workflow Layer",
    role: "Treasury Analyst · Treasury Manager · Platform Admin",
    detail: "Policy, authorization, audit, and enterprise RBAC",
  },
  {
    layer: "Fireblocks MPC Custody + Signing",
    role: "Custody infrastructure · TAP policy · co-signers",
    detail: "Keys never in application — signing at custody boundary",
  },
  {
    layer: "Blockchain Settlement Rails",
    role: "Ethereum Sepolia testnet · governed release",
    detail: "On-chain confirmation linked to webhook lifecycle",
  },
];

type LandingArchitectureModalProps = {
  open: boolean;
  fireblocksConnected: boolean;
  onClose: () => void;
};

export function LandingArchitectureModal({
  open,
  fireblocksConnected,
  onClose,
}: LandingArchitectureModalProps) {
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
      aria-labelledby="architecture-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl border border-ops-border bg-ops-bg shadow-[var(--ops-shadow-lg)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ops-border/70 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ops-text-dim">
              Architecture overview
            </p>
            <h2
              id="architecture-modal-title"
              className="mt-1.5 text-lg font-semibold tracking-tight text-ops-text"
            >
              Three-layer institutional stack
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ops-text-secondary">
              Operational workflow orchestration above MPC custody and blockchain settlement
              rails — each layer with distinct operational responsibility.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close architecture overview"
            className="-mr-1 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ops-border-subtle bg-ops-surface text-ops-text-secondary shadow-[var(--ops-shadow-sm)] transition hover:border-ops-border hover:bg-ops-overlay hover:text-ops-text"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-6 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <InfrastructureOverview fireblocksConnected={fireblocksConnected} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {ARCHITECTURE_LAYERS.map((item) => (
              <div
                key={item.layer}
                className="rounded-xl border border-ops-border-subtle bg-ops-surface px-4 py-4 shadow-[var(--ops-shadow-sm)]"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ops-info">
                  {item.layer}
                </p>
                <p className="mt-2 text-xs font-semibold text-ops-text">{item.role}</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-ops-text-secondary">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
