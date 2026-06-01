"use client";

import type { Transfer } from "@/lib/types";
import { getSettlementEvaluation } from "@/lib/policy";
import { formatCurrency } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import { Card, SectionHeader } from "@/components/ui/primitives";
import { RiskBadge, StatusBadge } from "@/components/ui/badges";

function EvaluationRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1 border-b border-ops-border py-2.5 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="shrink-0 text-[11px] font-medium text-ops-text-secondary">{label}</span>
      <span
        className={`min-w-0 break-words text-xs font-semibold text-ops-text sm:text-right ${mono ? "font-mono text-[11px]" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

export function PolicyEvaluationCard({ transfer }: { transfer: Transfer }) {
  const { state } = useAppStore();
  const evaluation = getSettlementEvaluation(transfer, state.policy);

  return (
    <Card variant="accent" className="ring-1 ring-ops-primary/10">
      <SectionHeader
        label="Policy engine"
        title="Operational evaluation"
        subtitle="Institutional treasury governance assessment before authorization release."
        titleHintLabel="What does this evaluation do?"
        titleHint="This is the application's pre-authorization check: it inspects the amount, counterparty, rail, and risk to decide whether the settlement can auto-release or must be routed for manager authorization. The enforced, non-bypassable rules live in the Fireblocks Transaction Authorization Policy shown below — this panel mirrors that intent at the workflow layer."
      />
      <div className="mb-3 flex flex-wrap gap-1.5">
        <StatusBadge status={transfer.status} />
        <RiskBadge level={transfer.riskLevel} />
      </div>
      <div className="rounded-lg border border-ops-border bg-ops-overlay/50 px-3">
        <EvaluationRow label="Settlement ID" value={transfer.id} mono />
        <EvaluationRow
          label="Settlement Amount"
          value={formatCurrency(evaluation.settlementAmount, evaluation.asset)}
        />
        <EvaluationRow label="Vault Account" value={evaluation.vaultAccount} />
        <EvaluationRow label="Settlement Rail" value={evaluation.settlementRail} />
        <EvaluationRow label="Counterparty Status" value={evaluation.counterpartyStatus} />
        <EvaluationRow
          label="Risk Level"
          value={evaluation.riskLevel === "medium" ? "Medium" : evaluation.riskLevel === "high" ? "High" : "Low"}
        />
        <EvaluationRow label="Policy Triggered" value={evaluation.policyTrigger} />
        <EvaluationRow label="Required Approver" value={evaluation.requiredApprover} />
        <EvaluationRow label="Status" value={evaluation.status} />
      </div>
    </Card>
  );
}
