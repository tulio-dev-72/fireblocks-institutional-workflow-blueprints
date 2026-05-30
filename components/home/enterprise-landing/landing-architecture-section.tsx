"use client";

import { InfrastructureOverview } from "@/components/auth/infrastructure-overview";
import { SectionHeader } from "@/components/ui/primitives";

type LandingArchitectureSectionProps = {
  fireblocksConnected: boolean;
};

export function LandingArchitectureSection({ fireblocksConnected }: LandingArchitectureSectionProps) {
  return (
    <section className="border-t border-ops-border/70 bg-ops-bg">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <SectionHeader
          label="Architecture overview"
          title="Three-layer institutional stack"
          subtitle="Operational workflow orchestration above MPC custody and blockchain settlement rails — each layer with distinct operational responsibility."
        />

        <div className="mx-auto max-w-3xl">
          <InfrastructureOverview fireblocksConnected={fireblocksConnected} />
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
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
          ].map((item) => (
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
    </section>
  );
}
