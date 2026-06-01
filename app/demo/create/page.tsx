"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionAccessRestricted } from "@/components/demo/action-access-restricted";
import { DemoTopBar } from "@/components/demo/top-bar";
import { FundTreasuryMainPanel } from "@/components/demo/fund-treasury-main-panel";
import { FireblocksSettlementInfrastructure } from "@/components/demo/fireblocks-settlement-infrastructure";
import { ConnectedWorkflowStepper } from "@/components/demo/connected-workflow-stepper";
import { Card, InputLabel, PrimaryButton, SectionHeader, TextInput } from "@/components/ui/primitives";
import { getDemoScenario } from "@/data/demo-scenarios";
import { PRIMARY_SETTLEMENT, isPrimaryBlueprint } from "@/data/primary-scenario";
import {
  FUNDING_REQUIRED_BEFORE_AUTHORIZATION,
  SETTLEMENT_RAIL_SEPOLIA,
} from "@/lib/fireblocks/constants";
import { useFireblocksTreasury } from "@/lib/fireblocks/use-fireblocks-treasury";
import { formatCurrency } from "@/lib/format";
import { trackProductEvent } from "@/lib/analytics";
import type { AccessRestrictionDetails } from "@/lib/auth/access-restriction";
import { useAppStore } from "@/lib/store";

export default function CreateTransferPage() {
  const router = useRouter();
  const { createTransfer, setWorkflowStep, effectiveRole, state } = useAppStore();
  const activeBlueprint = state.activeBlueprint;
  const treasury = useFireblocksTreasury();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessRestriction, setAccessRestriction] = useState<AccessRestrictionDetails | null>(null);

  const isPrimary = isPrimaryBlueprint(activeBlueprint);
  const scenario = getDemoScenario(activeBlueprint);
  const scenarioSettlement =
    scenario.transfers.find((transfer) => transfer.status === "PENDING_APPROVAL") ??
    scenario.transfers[0] ??
    null;

  const connected =
    isPrimary && treasury.state.integrationStatus === "connected" && Boolean(treasury.state.vault);
  const ethAvailable =
    treasury.state.sepoliaEthAvailable ?? treasury.sepoliaEthAsset?.available ?? 0;
  const needsFunding =
    isPrimary && connected && (treasury.state.fundingStatus === "needs_funding" || ethAvailable <= 0);

  // Settlement details: live Fireblocks values for the primary scenario, otherwise
  // the entered scenario's representative initiation.
  const settlementAsset = isPrimary
    ? connected && treasury.selectedAsset
      ? treasury.selectedAsset.assetId
      : PRIMARY_SETTLEMENT.asset
    : scenarioSettlement?.asset ?? PRIMARY_SETTLEMENT.asset;
  const settlementAmount = isPrimary
    ? PRIMARY_SETTLEMENT.amount
    : scenarioSettlement?.amount ?? PRIMARY_SETTLEMENT.amount;
  const counterparty = isPrimary
    ? PRIMARY_SETTLEMENT.counterparty
    : scenarioSettlement?.destinationLabel ?? PRIMARY_SETTLEMENT.counterparty;
  const destination = isPrimary
    ? PRIMARY_SETTLEMENT.counterpartyAddress
    : scenarioSettlement?.destination ?? PRIMARY_SETTLEMENT.counterpartyAddress;
  const settlementReason = isPrimary
    ? PRIMARY_SETTLEMENT.reason
    : scenarioSettlement?.reason ?? PRIMARY_SETTLEMENT.reason;
  const sourceVaultName = treasury.state.vault?.name ?? PRIMARY_SETTLEMENT.sourceVault;
  const settlementRail = isPrimary
    ? treasury.state.settlementRail || SETTLEMENT_RAIL_SEPOLIA
    : scenarioSettlement?.settlementRail ?? SETTLEMENT_RAIL_SEPOLIA;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setAccessRestriction(null);

    if (needsFunding) {
      setError(FUNDING_REQUIRED_BEFORE_AUTHORIZATION);
      return;
    }

    const result = await createTransfer({
      asset: settlementAsset,
      amount: settlementAmount,
      destination,
      destinationLabel: counterparty,
      reason: settlementReason,
      sourceVaultId: isPrimary ? treasury.state.vault?.id : undefined,
      sourceVault: isPrimary ? treasury.state.vault?.name ?? PRIMARY_SETTLEMENT.sourceVault : sourceVaultName,
      settlementRail,
      counterparty,
    });

    if (!result.ok) {
      if (result.restriction) {
        setAccessRestriction(result.restriction);
      }
      setError(result.error);
      return;
    }

    setSubmitted(true);
    trackProductEvent("settlement_created", {
      page: "/demo/create",
      workflow_type: activeBlueprint ?? "stablecoin-payouts",
      role: effectiveRole ?? "unknown",
      status: "submitted",
    });
    setWorkflowStep("policy");
    setTimeout(() => router.push("/demo/policy"), 600);
  }

  return (
    <>
      <DemoTopBar
        title="Initiate Settlement"
        subtitle={
          isPrimary
            ? "Treasury Analyst submits Sepolia test settlement for policy evaluation and Fireblocks authorization."
            : `Treasury Analyst initiates the ${scenario.headline.toLowerCase()} for policy evaluation and Fireblocks authorization.`
        }
      />
      <ConnectedWorkflowStepper />

      <main className="ops-page">
        <form onSubmit={handleSubmit} className="space-y-3">
          {isPrimary ? (
            <>
              <FundTreasuryMainPanel />
              <FireblocksSettlementInfrastructure treasury={treasury} amount={settlementAmount} />
            </>
          ) : (
            <Card variant="accent">
              <SectionHeader
                label="Scenario context"
                title={scenario.headline}
                subtitle={scenario.queueSummary}
              />
            </Card>
          )}

          <Card variant="elevated">
            <SectionHeader
              label="Settlement request"
              title="Outbound settlement"
              subtitle={
                isPrimary
                  ? connected && treasury.selectedAsset
                    ? `Available ${formatCurrency(treasury.selectedAsset.available, treasury.selectedAsset.assetId)} in ${treasury.state.vault?.name ?? PRIMARY_SETTLEMENT.sourceVault}`
                    : "Connect Fireblocks to load Treasury Main balances from the SDK."
                  : `Representative settlement on the ${settlementRail} rail — submitted through the same policy and authorization pipeline.`
              }
            />

            <div className="space-y-4">
              <div>
                <InputLabel htmlFor="asset">Asset (Fireblocks assetId)</InputLabel>
                <TextInput
                  id="asset"
                  value={settlementAsset}
                  readOnly
                  className="bg-ops-overlay/50 font-mono text-[11px]"
                />
              </div>
              <div>
                <InputLabel htmlFor="amount">Amount</InputLabel>
                <TextInput
                  id="amount"
                  value={formatCurrency(settlementAmount, settlementAsset)}
                  readOnly
                  className="bg-ops-overlay/50 font-semibold tabular-nums"
                />
              </div>
              <div>
                <InputLabel htmlFor="sourceVault">Source Vault</InputLabel>
                <TextInput
                  id="sourceVault"
                  value={isPrimary ? treasury.state.vault?.name ?? PRIMARY_SETTLEMENT.sourceVault : sourceVaultName}
                  readOnly
                  className="bg-ops-overlay/50"
                />
              </div>
              {isPrimary && treasury.state.vault ? (
                <div>
                  <InputLabel htmlFor="sourceVaultId">Source Vault ID</InputLabel>
                  <TextInput
                    id="sourceVaultId"
                    value={treasury.state.vault.id}
                    readOnly
                    className="bg-ops-overlay/50 font-mono text-[11px]"
                  />
                </div>
              ) : null}
              <div>
                <InputLabel htmlFor="counterparty">Counterparty</InputLabel>
                <TextInput id="counterparty" value={counterparty} readOnly className="bg-ops-overlay/50" />
              </div>
              <div>
                <InputLabel htmlFor="rail">Settlement Rail</InputLabel>
                <TextInput id="rail" value={settlementRail} readOnly className="bg-ops-overlay/50" />
              </div>
              <div>
                <InputLabel htmlFor="reason">Reason</InputLabel>
                <TextInput id="reason" value={settlementReason} readOnly className="bg-ops-overlay/50" />
              </div>
            </div>
          </Card>

          {needsFunding ? (
            <Card variant="accent">
              <p className="text-xs text-ops-warning">{FUNDING_REQUIRED_BEFORE_AUTHORIZATION}</p>
            </Card>
          ) : null}

          {accessRestriction ? (
            <ActionAccessRestricted
              action="create_settlement"
              requiredRoles={["analyst"]}
              currentRole={effectiveRole}
              restriction={accessRestriction}
              returnHref="/demo"
            />
          ) : null}

          {error && !accessRestriction ? (
            <Card variant="accent">
              <p className="text-xs text-ops-danger">{error}</p>
            </Card>
          ) : null}

          <PrimaryButton type="submit" className="w-full" disabled={submitted || needsFunding}>
            {submitted ? "Evaluating policy…" : "Submit Settlement"}
          </PrimaryButton>
        </form>
      </main>
    </>
  );
}
