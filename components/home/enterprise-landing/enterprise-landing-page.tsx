"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { SandboxLoginScreen } from "@/components/auth/sandbox-login-screen";
import { PageLoadingState } from "@/components/ui/page-loading-state";
import { InfrastructureStoriesSection } from "@/components/home/enterprise-landing/infrastructure-stories-section";
import { LandingCommandCenterModal } from "@/components/home/enterprise-landing/landing-command-center-modal";
import { LandingArchitectureModal } from "@/components/home/enterprise-landing/landing-architecture-modal";
import { LandingHeader } from "@/components/home/enterprise-landing/landing-header";
import { LandingHero } from "@/components/home/enterprise-landing/landing-hero";
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
  const [architectureOpen, setArchitectureOpen] = useState(false);
  const [commandCenterOpen, setCommandCenterOpen] = useState(false);
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

        // Keep the "signing in as {role}" screen visible long enough to read.
        await new Promise((resolve) => setTimeout(resolve, 1200));

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

  if (busyRole) {
    return <SandboxLoginScreen role={busyRole} />;
  }

  if (entering || (effectiveRole && !busyRole)) {
    return <PageLoadingState label="Entering operational workspace…" />;
  }

  return (
    <div className="min-h-screen bg-ops-bg text-ops-text">
      <LandingHeader
        connected={infrastructure.connected}
        onOpenArchitecture={() => setArchitectureOpen(true)}
        onOpenCommandCenter={() => setCommandCenterOpen(true)}
      />

      <LandingHero
        stats={infrastructure.heroStats}
        onLaunchSandbox={() => scrollToSection("sandbox-access")}
        onViewScenarios={() => scrollToSection("settlement-scenarios")}
      />

      <InfrastructureStoriesSection
        busyRole={busyRole}
        onEnterRole={(role) => void handleEnterRole(role)}
      />

      <SandboxAccessSection busyRole={busyRole} error={error} onEnterRole={(role) => void handleEnterRole(role)} />

      <LandingArchitectureModal
        open={architectureOpen}
        fireblocksConnected={infrastructure.connected}
        onClose={() => setArchitectureOpen(false)}
      />

      <LandingCommandCenterModal
        open={commandCenterOpen}
        insights={infrastructure.preview.insights}
        onClose={() => setCommandCenterOpen(false)}
      />
    </div>
  );
}
