"use client";

import { RiskBadge } from "@/components/ui/badges";
import { Card, SectionHeader } from "@/components/ui/primitives";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import type { OperationalRiskSnapshot } from "@/lib/operations/metrics";

function RiskMetricRow({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-ops-border-subtle bg-ops-overlay/35 px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ops-text-dim">
          {label}
        </p>
        <InfoTooltip label={`About ${label}`} content={hint} side="bottom" />
      </div>
      <p className="mt-1 text-sm font-medium leading-snug text-ops-text">{value}</p>
    </div>
  );
}

type OperationalRiskPanelProps = {
  risk: OperationalRiskSnapshot;
};

export function OperationalRiskPanel({ risk }: OperationalRiskPanelProps) {
  return (
    <Card variant="surface">
      <SectionHeader
        label="Operational risk"
        title="Risk posture"
        subtitle={
          risk.focusTransferId
            ? `Derived from ${risk.focusTransferId} and current infrastructure readiness.`
            : "Derived from active settlement profile and infrastructure readiness."
        }
      />

      <div className="mb-3 flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ops-text-dim">
          Risk level
        </span>
        <RiskBadge level={risk.riskLevel} />
        <InfoTooltip
          label="What is Risk level?"
          content="The overall risk rating for the focus settlement, set by the policy engine from amount, destination allowlist, and infrastructure readiness. Low can auto-clear; medium/high require manager authorization."
          side="bottom"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <RiskMetricRow
          label="Policy triggered"
          value={risk.policyTriggered}
          hint="Which policy rule applies to this settlement — e.g. a high-value threshold or an allowlist check. This is the app-side rule that decides whether manager authorization is required."
        />
        <RiskMetricRow
          label="Counterparty status"
          value={risk.counterpartyStatus}
          hint="Whether the destination is on the approved allowlist. An unlisted counterparty raises risk and forces policy review before any release."
        />
        <RiskMetricRow
          label="Gas readiness"
          value={risk.gasReadiness}
          hint="Whether Treasury Main holds enough Sepolia test ETH to pay network gas. Without gas, an authorized transaction can't broadcast — so this gates settlement."
        />
        <RiskMetricRow
          label="Settlement rail health"
          value={risk.settlementRailHealth}
          hint="The status of the blockchain network used for settlement (Ethereum Sepolia in this demo) — confirming whether the rail is available to broadcast and confirm transactions."
        />
      </div>
    </Card>
  );
}
