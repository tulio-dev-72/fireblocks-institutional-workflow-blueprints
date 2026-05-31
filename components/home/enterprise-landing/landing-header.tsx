"use client";

import { IntegrationStatusBadge } from "@/components/ui/badges";

type LandingHeaderProps = {
  connected: boolean;
};

export function LandingHeader({ connected }: LandingHeaderProps) {
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
          <IntegrationStatusBadge status={connected ? "connected" : "offline"} />
        </div>
      </div>
    </header>
  );
}
