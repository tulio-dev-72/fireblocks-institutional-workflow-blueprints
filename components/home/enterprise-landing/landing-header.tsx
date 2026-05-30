"use client";

import Link from "next/link";
import { IntegrationStatusBadge } from "@/components/ui/badges";

type LandingHeaderProps = {
  connected: boolean;
  isSupabaseAuth: boolean;
};

export function LandingHeader({ connected, isSupabaseAuth }: LandingHeaderProps) {
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
          {isSupabaseAuth ? (
            <Link
              href="/auth/sign-in"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-ops-border bg-ops-surface px-3.5 py-2 text-xs font-semibold text-ops-text-secondary transition hover:border-ops-primary/30 hover:text-ops-text"
            >
              Institutional sign-in
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
