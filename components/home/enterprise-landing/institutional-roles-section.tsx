"use client";

import { SANDBOX_FOOTER_NOTE, SANDBOX_ROLES } from "@/data/sandbox-roles";

export function InstitutionalRolesSection() {
  return (
    <section id="institutional-roles" className="border-t border-ops-border bg-ops-primary text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
            Institutional roles
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            Segregation of duties across every workflow
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/75">
            Each settlement scenario runs across these three roles — initiation, authorization, and
            governance. Enter any scenario above as the role you want to operate.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-2.5 sm:grid-cols-3">
          {SANDBOX_ROLES.map((entry) => (
            <article
              key={entry.role}
              className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-4 text-left"
            >
              <h3 className="text-sm font-semibold text-white">{entry.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-white/70">{entry.description}</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.08em] text-white/45">
                {entry.responsibility}
              </p>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-[11px] leading-relaxed text-white/45">
          {SANDBOX_FOOTER_NOTE}
        </p>
      </div>
    </section>
  );
}
