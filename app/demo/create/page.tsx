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
    treasury.state.integrationStatus === "connected" && Boolean(treasury.state.vault);
  const ethAvailable =
    treasury.state.sepoliaEthAvailable ?? treasury.sepoliaEthAsset?.available ?? 0;
  const needsFunding =
    connected && (treasury.state.fundingStatus === "needs_funding" || ethAvailable <= 0);

  // Every scenario settles from the live Treasury Main vault. The scenario
  // defines the amount, counterparty, and reason; the asset settled is whatever
  // the vault actually holds (the selected activated asset), so the displayed
  // asset always matches what Fireblocks signs.
  const fallbackAsset = isPrimary
    ? PRIMARY_SETTLEMENT.asset
    : scenarioSettlement?.asset ?? PRIMARY_SETTLEMENT.asset;
  const settlementAsset =
    connected && treasury.selectedAsset ? treasury.selectedAsset.assetId : fallbackAsset;
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
  const sourceVaultName =
    (connected ? treasury.state.vault?.name : undefined) ??
    (isPrimary ? PRIMARY_SETTLEMENT.sourceVault : scenarioSettlement?.sourceVault) ??
    PRIMARY_SETTLEMENT.sourceVault;
  const settlementRail = connected
    ? treasury.state.settlementRail || SETTLEMENT_RAIL_SEPOLIA
    : isPrimary
      ? SETTLEMENT_RAIL_SEPOLIA
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
      sourceVaultId: connected ? treasury.state.vault?.id : undefined,
      sourceVault: sourceVaultName,
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
        subtitle="Treasury Analyst submits the settlement for policy evaluation and Fireblocks authorization."
      />
      <ConnectedWorkflowStepper />

      <main className="ops-page">
        <form onSubmit={handleSubmit} className="space-y-3">
          {!isPrimary ? (
            <Card variant="accent">
              <SectionHeader
                label="Scenario context"
                title={scenario.headline}
                subtitle={scenario.queueSummary}
              />
            </Card>
          ) : null}

          {connected ? (
            <>
              <FundTreasuryMainPanel />
              <FireblocksSettlementInfrastructure treasury={treasury} amount={settlementAmount} />
            </>
          ) : (
            <Card variant="accent">
              <SectionHeader
                label="Fireblocks custody"
                title="Connect Fireblocks to load Treasury Main"
                subtitle="Vault balances, activated assets, and the deposit address load live from the Fireblocks SDK once the sandbox is connected."
              />
            </Card>
          )}

          <Card variant="elevated">
            <SectionHeader
              label="Settlement request"
              titleHintLabel="What is the settlement request?"
              titleHint="The outbound transaction being submitted for governance: what's moving, from which vault, to whom, and on which rail. It's read-only here because the active scenario defines it — submitting routes it into policy evaluation and (if required) manager authorization before Fireblocks signs."
              title="Outbound settlement"
              subtitle={
                connected && treasury.selectedAsset
                  ? `Available ${formatCurrency(treasury.selectedAsset.available, treasury.selectedAsset.assetId)} in ${treasury.state.vault?.name ?? PRIMARY_SETTLEMENT.sourceVault}`
                  : "Connect Fireblocks to load Treasury Main balances from the SDK."
              }
            />

            <div className="space-y-4">
              <div>
                <InputLabel
                  htmlFor="asset"
                  hintLabel="About the settlement asset"
                  hint="Fireblocks identifies every asset by an assetId. This demo settles Sepolia test ETH (ETH_TEST5) — the identical policy evaluation and MPC custody pipeline governs USDC stablecoin payouts in production."
                >
                  Asset (Fireblocks assetId)
                </InputLabel>
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
                <InputLabel
                  htmlFor="sourceVault"
                  hintLabel="About the source vault"
                  hint="A Fireblocks vault account where assets are held in MPC custody. Funds can only leave after the transaction is authorized and signed — no single person holds a private key."
                >
                  Source Vault
                </InputLabel>
                <TextInput
                  id="sourceVault"
                  value={sourceVaultName}
                  readOnly
                  className="bg-ops-overlay/50"
                />
              </div>
              {connected && treasury.state.vault ? (
                <div>
                  <InputLabel
                    htmlFor="sourceVaultId"
                    hintLabel="About the vault ID"
                    hint="The Fireblocks internal identifier for this vault account, used by the API to scope the transaction to the correct custody source."
                  >
                    Source Vault ID
                  </InputLabel>
                  <TextInput
                    id="sourceVaultId"
                    value={treasury.state.vault.id}
                    readOnly
                    className="bg-ops-overlay/50 font-mono text-[11px]"
                  />
                </div>
              ) : null}
              <div>
                <InputLabel
                  htmlFor="counterparty"
                  hintLabel="About the counterparty"
                  hint="The destination this settlement pays out to. A destination that isn't on the approved allowlist triggers policy review before any release."
                >
                  Counterparty
                </InputLabel>
                <TextInput id="counterparty" value={counterparty} readOnly className="bg-ops-overlay/50" />
              </div>
              <div>
                <InputLabel
                  htmlFor="rail"
                  hintLabel="About the settlement rail"
                  hint="The blockchain network the transaction is signed for and broadcast on. This demo uses the Ethereum Sepolia testnet."
                >
                  Settlement Rail
                </InputLabel>
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
