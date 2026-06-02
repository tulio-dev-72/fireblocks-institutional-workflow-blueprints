"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DemoBottomNav } from "@/components/demo/bottom-nav";
import { DemoRouteGuard } from "@/components/demo/route-guard";
import { PageLoadingState } from "@/components/ui/page-loading-state";
import { useFireblocksStatusSync } from "@/lib/fireblocks/use-fireblocks-status-sync";
import { ACCESS_PORTAL } from "@/lib/supabase/routes";
import { useAppStore } from "@/lib/store";

// Switching roles swaps the underlying auth account, which can briefly null the
// effective role between sign-out and the new sign-in. Tolerate that transient
// window before redirecting so an in-flight role switch never bounces to home.
const MISSING_ROLE_GRACE_MS = 600;

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { sessionReady, effectiveRole } = useAppStore();
  const showShell = sessionReady && effectiveRole !== null;
  const [graceElapsed, setGraceElapsed] = useState(false);

  useFireblocksStatusSync();

  useEffect(() => {
    if (!sessionReady || effectiveRole) {
      setGraceElapsed(false);
      return;
    }
    const timer = setTimeout(() => setGraceElapsed(true), MISSING_ROLE_GRACE_MS);
    return () => clearTimeout(timer);
  }, [sessionReady, effectiveRole]);

  useEffect(() => {
    if (sessionReady && !effectiveRole && graceElapsed) {
      router.replace(ACCESS_PORTAL);
    }
  }, [sessionReady, effectiveRole, graceElapsed, router]);

  if (!sessionReady) {
    return <PageLoadingState label="Loading operational workspace…" />;
  }

  if (!effectiveRole) {
    return <PageLoadingState label="Loading operational workspace…" />;
  }

  return (
    <div className="min-h-screen bg-ops-bg">
      <div className={`mx-auto min-h-screen min-w-0 max-w-lg md:max-w-2xl xl:max-w-4xl ${showShell ? "pb-24" : ""}`}>
        <DemoRouteGuard>{children}</DemoRouteGuard>
      </div>
      {showShell ? <DemoBottomNav /> : null}
    </div>
  );
}
