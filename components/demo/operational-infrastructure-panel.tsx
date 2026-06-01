"use client";

import { LiveBadge } from "@/components/ui/badges";
import { Card, SectionHeader } from "@/components/ui/primitives";
import { InfrastructureStatusPanel } from "@/components/demo/infrastructure-status-panel";
import {
  buildInfrastructureStatus,
  type WebhookStreamSummary,
} from "@/lib/fireblocks/infrastructure-status";
import type { FireblocksTreasuryState } from "@/lib/fireblocks/types";

type OperationalInfrastructurePanelProps = {
  treasury: FireblocksTreasuryState;
  loading: boolean;
  fireblocksConnected: boolean;
  webhookSummary: WebhookStreamSummary;
};

export function OperationalInfrastructurePanel({
  treasury,
  loading,
  fireblocksConnected,
  webhookSummary,
}: OperationalInfrastructurePanelProps) {
  const items = buildInfrastructureStatus({
    integrationStatus: treasury.integrationStatus,
    fundingStatus: treasury.fundingStatus,
    ethAvailable: treasury.sepoliaEthAvailable,
    webhookEndpointActive: treasury.webhookEndpointActive,
    webhookStream: webhookSummary,
  });

  return (
    <Card variant="accent">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <SectionHeader
            label="Infrastructure"
            title="Custody and settlement rail status"
            subtitle="Live Fireblocks SDK signals for Treasury Main, MPC custody, webhooks, and Ethereum Sepolia."
            titleHintLabel="What does this panel show?"
            titleHint="The real-time health of the plumbing a settlement depends on, read live from Fireblocks: API connectivity, Treasury Main funding, the MPC custody/signing layer, the webhook event stream, and the Sepolia rail. Each signal must be green for an authorized settlement to actually sign and broadcast."
          />
        </div>
        <LiveBadge live={fireblocksConnected} />
      </div>

      {loading ? (
        <p className="text-xs text-ops-text-secondary">Loading infrastructure state…</p>
      ) : (
        <InfrastructureStatusPanel items={items} />
      )}
    </Card>
  );
}
