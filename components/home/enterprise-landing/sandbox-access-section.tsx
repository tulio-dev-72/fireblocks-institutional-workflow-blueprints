"use client";

import { SecondaryButton } from "@/components/ui/primitives";
import {
  SANDBOX_ACCESS_LABEL,
  SANDBOX_FOOTER_NOTE,
  SANDBOX_ROLES,
} from "@/data/sandbox-roles";
import type { UserRole } from "@/lib/types";

type SandboxAccessSectionProps = {
  busyRole: UserRole | null;
  error: string | null;
  onEnterRole: (role: UserRole) => void;
};

export function SandboxAccessSection({
  busyRole,
  error,
  onEnterRole,
}: SandboxAccessSectionProps) {
  return (
    <section id="sandbox-access" className="border-t border-ops-border bg-ops-primary text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
            Operational sandbox
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            Launch with an institutional role
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/75">
            Enter the live Treasury Control Center with role-based access — settlement initiation,
            authorization queue, governance policy, and Fireblocks integration oversight.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-sm sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">
            {SANDBOX_ACCESS_LABEL}
          </p>

          <div className="mt-4 space-y-2.5">
            {SANDBOX_ROLES.map((entry) => (
              <article
                key={entry.role}
                className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 text-left">
                    <h3 className="text-sm font-semibold text-white">{entry.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-white/70">{entry.description}</p>
                    <p className="mt-1.5 text-[10px] text-white/45">{entry.responsibility}</p>
                  </div>
                  <SecondaryButton
                    type="button"
                    className="w-full shrink-0 border-white/20 bg-white/10 text-white hover:border-white/35 hover:bg-white/15 sm:w-auto sm:min-w-[10rem]"
                    disabled={busyRole !== null}
                    onClick={() => onEnterRole(entry.role)}
                  >
                    {busyRole === entry.role ? "Entering…" : entry.actionLabel}
                  </SecondaryButton>
                </div>
              </article>
            ))}
          </div>

          {error ? (
            <p className="mt-3 rounded-lg border border-ops-danger/40 bg-ops-danger/20 px-3 py-2 text-[11px] text-white">
              {error}
            </p>
          ) : null}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-[11px] leading-relaxed text-white/45">
          {SANDBOX_FOOTER_NOTE}
        </p>
      </div>
    </section>
  );
}
