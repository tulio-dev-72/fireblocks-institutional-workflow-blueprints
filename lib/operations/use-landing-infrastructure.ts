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

    return [
      { id: "fireblocks", label: "Fireblocks Connected", status: resolve(connected) },
      { id: "webhook", label: "Webhook Stream Active", status: resolve(treasury.webhookEndpointActive) },
      { id: "mpc", label: "MPC Custody Layer Online", status: resolve(funded) },
      { id: "treasury", label: "Treasury Main Funded", status: resolve(funded) },
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
