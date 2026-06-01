"use client";

import { IntegrationStatusBadge } from "@/components/ui/badges";

type LandingHeaderProps = {
  status: "connected" | "provisioned" | "offline";
  onOpenArchitecture: () => void;
  onOpenCommandCenter: () => void;
};

export function LandingHeader({
  status,
  onOpenArchitecture,
  onOpenCommandCenter,
}: LandingHeaderProps) {
  return (
    <header className="relative z-20 border-b border-ops-border/80 bg-ops-surface/90 shadow-[var(--ops-shadow-sm)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ops-text-dim">
            Institutional operational infrastructure
          </p>
          <p className="mt-0.5 text-sm font-semibold tracking-tight text-ops-text sm:text-base">
            Treasury Control Center
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenArchitecture}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ops-border-subtle bg-ops-surface px-3 py-2 text-xs font-semibold text-ops-text-secondary shadow-[var(--ops-shadow-sm)] transition hover:border-ops-border hover:bg-ops-overlay hover:text-ops-text"
          >
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <rect x="3" y="3" width="14" height="4" rx="1" />
              <rect x="3" y="8" width="14" height="4" rx="1" />
              <rect x="3" y="13" width="14" height="4" rx="1" />
            </svg>
            Architecture
          </button>
          <button
            type="button"
            onClick={onOpenCommandCenter}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ops-info/30 bg-ops-info-muted/20 px-3 py-2 text-xs font-semibold text-ops-info shadow-[var(--ops-shadow-sm)] transition hover:bg-ops-info-muted/35"
          >
            Trusted AI Command Center →
          </button>
          <IntegrationStatusBadge status={status} />
        </div>
      </div>
    </header>
  );
}
