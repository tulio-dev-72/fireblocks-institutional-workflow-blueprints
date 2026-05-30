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

  const heroStats = useMemo(
    () => [
      {
        id: "fireblocks",
        label: "Fireblocks Connected",
        active: treasury.integrationStatus === "connected",
      },
      {
        id: "webhook",
        label: "Webhook Stream Active",
        active: treasury.webhookEndpointActive,
      },
      {
        id: "mpc",
        label: "MPC Custody Layer Online",
        active:
          treasury.integrationStatus === "connected" &&
          (treasury.fundingStatus === "ready" ||
            (treasury.sepoliaEthAvailable ?? 0) > 0),
      },
      {
        id: "treasury",
        label: "Treasury Main Funded",
        active:
          treasury.integrationStatus === "connected" &&
          (treasury.fundingStatus === "ready" ||
            (treasury.sepoliaEthAvailable ?? 0) > 0),
      },
    ],
    [treasury],
  );

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
