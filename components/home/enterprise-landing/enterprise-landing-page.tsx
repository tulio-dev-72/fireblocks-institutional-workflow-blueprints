"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { PageLoadingState } from "@/components/ui/page-loading-state";
import { InfrastructureStoriesSection } from "@/components/home/enterprise-landing/infrastructure-stories-section";
import { LandingAiIntelligence } from "@/components/home/enterprise-landing/landing-ai-intelligence";
import { LandingArchitectureSection } from "@/components/home/enterprise-landing/landing-architecture-section";
import { LandingHeader } from "@/components/home/enterprise-landing/landing-header";
import { LandingHero } from "@/components/home/enterprise-landing/landing-hero";
import { LiveOperationsPreview } from "@/components/home/enterprise-landing/live-operations-preview";
import { SandboxAccessSection } from "@/components/home/enterprise-landing/sandbox-access-section";
import { prepareSandboxSession, resolveSandboxNavigation } from "@/lib/auth/prepare-sandbox-session";
import { launchSandboxRole } from "@/lib/auth/sandbox-login";
import { trackProductEvent } from "@/lib/analytics";
import { useLandingInfrastructure } from "@/lib/operations/use-landing-infrastructure";
import { useAppStore } from "@/lib/store";
import type { UserRole } from "@/lib/types";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function EnterpriseLandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedNext = searchParams.get("next");
  const { loading, isSupabaseAuth, isDemoMode, refreshSession } = useAuth();
  const { effectiveRole, setRole, setActiveBlueprint, setWorkflowStep, sessionReady } = useAppStore();
  const infrastructure = useLandingInfrastructure();
  const [busyRole, setBusyRole] = useState<UserRole | null>(null);
  const [entering, setEntering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const statusTracked = useRef(false);

  useEffect(() => {
    if (loading || statusTracked.current) return;
    if (!infrastructure.loading) {
      statusTracked.current = true;
      trackProductEvent("fireblocks_status_checked", {
        page: "/",
        connected: infrastructure.connected,
        status: infrastructure.connected ? "connected" : "offline",
      });
    }
  }, [loading, infrastructure.loading, infrastructure.connected]);

  useEffect(() => {
    if (loading || !sessionReady || busyRole || entering) {
      return;
    }

    if (effectiveRole) {
      router.replace(resolveSandboxNavigation(effectiveRole, requestedNext));
    }
  }, [loading, sessionReady, effectiveRole, busyRole, entering, requestedNext, router]);

  const handleEnterRole = useCallback(
    async (role: UserRole) => {
      setBusyRole(role);
      setEntering(true);
      setError(null);

      try {
        const result = await launchSandboxRole(role, {
          isSupabaseAuth,
          isDemoMode,
          refreshSession,
        });

        if (!result.ok) {
          setError(result.error);
          return;
        }

        trackProductEvent("demo_login", {
          page: "/",
          role: result.role,
          workflow_type: "sandbox_access",
        });

        prepareSandboxSession(result.role, {
          setRole,
          setActiveBlueprint,
          setWorkflowStep,
        });

        const destination = resolveSandboxNavigation(result.role, requestedNext);
        router.push(destination);
        router.refresh();
      } catch (enterError) {
        setError(enterError instanceof Error ? enterError.message : "Unable to enter sandbox.");
      } finally {
        setBusyRole(null);
        setEntering(false);
      }
    },
    [
      isSupabaseAuth,
      isDemoMode,
      refreshSession,
      setRole,
      setActiveBlueprint,
      setWorkflowStep,
      requestedNext,
      router,
    ],
  );

  if (loading || !sessionReady) {
    return <PageLoadingState label="Loading Treasury Control Center…" />;
  }

  if (entering || (effectiveRole && !busyRole)) {
    return <PageLoadingState label="Entering operational workspace…" />;
  }

  return (
    <div className="min-h-screen bg-ops-bg text-ops-text">
      <LandingHeader connected={infrastructure.connected} isSupabaseAuth={isSupabaseAuth} />

      <LandingHero
        stats={infrastructure.heroStats}
        onLaunchSandbox={() => scrollToSection("sandbox-access")}
        onExploreStories={() => scrollToSection("infrastructure-stories")}
      />

      <InfrastructureStoriesSection onExploreWorkflow={() => scrollToSection("sandbox-access")} />

      <LiveOperationsPreview
        preview={infrastructure.preview}
        infrastructureItems={infrastructure.infrastructureItems}
        connected={infrastructure.connected}
      />

      <LandingAiIntelligence insights={infrastructure.preview.insights} />

      <LandingArchitectureSection fireblocksConnected={infrastructure.connected} />

      <SandboxAccessSection busyRole={busyRole} error={error} onEnterRole={(role) => void handleEnterRole(role)} />

      {isSupabaseAuth ? (
        <p className="border-t border-ops-border/60 bg-ops-surface py-4 text-center text-[11px] text-ops-text-dim">
          Organization credentials?{" "}
          <a href="/auth/sign-in" className="font-semibold text-ops-primary hover:underline">
            Institutional sign-in
          </a>
        </p>
      ) : null}
    </div>
  );
}
