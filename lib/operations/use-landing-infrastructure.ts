"use client";

import { useEffect, useMemo, useState } from "react";

import { fetchFireblocksTreasuryState } from "@/lib/fireblocks/api-client";
import { buildInfrastructureStatus } from "@/lib/fireblocks/infrastructure-status";
import type { FireblocksTreasuryState } from "@/lib/fireblocks/types";
import { OFFLINE_TREASURY_STATE } from "@/lib/fireblocks/types";

import { buildLandingPreviewSnapshot } from "./landing-preview";

export function useLandingInfrastructure() {
  const [treasury, setTreasury] = useState<FireblocksTreasuryState>(OFFLINE_TREASURY_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const next = await fetchFireblocksTreasuryState();
        if (!cancelled) {
          setTreasury(next);
        }
      } catch {
        if (!cancelled) {
          setTreasury(OFFLINE_TREASURY_STATE);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    const interval = window.setInterval(() => {
      void load();
    }, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const infrastructureItems = useMemo(
    () =>
      buildInfrastructureStatus({
        integrationStatus: treasury.integrationStatus,
        fundingStatus: treasury.fundingStatus,
        ethAvailable: treasury.sepoliaEthAvailable,
        webhookEndpointActive: treasury.webhookEndpointActive,
      }),
    [treasury],
  );

  const heroStats = useMemo(() => {
    const connected = treasury.integrationStatus === "connected";
    // Credentials are configured server-side, but live detail is gated behind
    // an operational role on the public landing (anonymous = configured, not connected).
    const provisioned = connected || treasury.configured;
    const funded =
      connected &&
      (treasury.fundingStatus === "ready" || (treasury.sepoliaEthAvailable ?? 0) > 0);

    const resolve = (live: boolean): "active" | "provisioned" | "inactive" =>
      live ? "active" : provisioned ? "provisioned" : "inactive";

    // Label reflects the real state — never claim "Connected" while offline/provisioned.
    const label = (live: boolean, liveLabel: string, provLabel: string, offLabel: string) =>
      live ? liveLabel : provisioned ? provLabel : offLabel;

    return [
      {
        id: "fireblocks",
        label: label(connected, "Fireblocks Connected", "Fireblocks Provisioned", "Fireblocks Offline"),
        status: resolve(connected),
        hint: "Whether this workspace has a live link to the Fireblocks API. When connected, vault balances, accounts, and transactions are read from and written to the real Fireblocks sandbox — not mocked. The public landing reads “Provisioned” (credentials configured server-side) until you enter an operational role.",
      },
      {
        id: "webhook",
        label: label(
          treasury.webhookEndpointActive,
          "Webhook Stream Active",
          "Webhook Stream Provisioned",
          "Webhook Stream Offline",
        ),
        status: resolve(treasury.webhookEndpointActive),
        hint: "Fireblocks pushes transaction lifecycle events — signing, broadcast, confirmation — to this app’s webhook endpoint. “Active” means that endpoint is live and receiving real, signature-verified event deliveries that drive the settlement timeline and audit trail.",
      },
      {
        id: "mpc",
        label: label(funded, "MPC Custody Layer Online", "MPC Custody Provisioned", "MPC Custody Offline"),
        status: resolve(funded),
        hint: "The Fireblocks Multi-Party Computation custody layer that holds the wallet keys. The signing key is split across parties, so no single person or server ever holds a full private key — transactions are only signed once policy is satisfied. “Online” means custody is provisioned and ready to sign approved settlements.",
      },
      {
        id: "treasury",
        label: label(funded, "Treasury Main Funded", "Treasury Main Provisioned", "Treasury Main Unfunded"),
        status: resolve(funded),
        hint: "The funding status of the Treasury Main vault account. “Funded” means it holds enough Sepolia test ETH to cover gas and settlement, so an authorized transaction can actually be signed and broadcast on-chain.",
      },
    ];
  }, [treasury]);

  const preview = useMemo(() => buildLandingPreviewSnapshot(treasury), [treasury]);

  return {
    treasury,
    loading,
    infrastructureItems,
    heroStats,
    preview,
    connected: treasury.integrationStatus === "connected",
  };
}
