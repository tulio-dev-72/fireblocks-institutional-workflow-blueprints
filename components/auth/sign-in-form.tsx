"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { DemoAccountsPanel } from "@/components/auth/demo-accounts-panel";
import { Card, SectionHeader } from "@/components/ui/primitives";
import { ACCESS_PORTAL_TITLE } from "@/data/sandbox-roles";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchUserProfile } from "@/lib/supabase/profiles";
import { ACCESS_PORTAL, AUTH_ROLE, OPERATIONS_HOME } from "@/lib/supabase/routes";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSupabaseAuth, refreshSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const next = searchParams.get("next") ?? OPERATIONS_HOME;

  useEffect(() => {
    if (!isSupabaseAuth) {
      router.replace(ACCESS_PORTAL);
    }
  }, [isSupabaseAuth, router]);

  async function signIn(emailValue: string, passwordValue: string) {
    setError(null);
    setSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: emailValue.trim(),
        password: passwordValue,
      });

      if (signInError) {
        setError(
          signInError.message === "Invalid login credentials"
            ? "Sandbox accounts are not seeded in Supabase. Run supabase/seed-users.sql, or use the role buttons on the access portal."
            : signInError.message,
        );
        return;
      }

      await refreshSession();

      const {
        data: { user: signedInUser },
      } = await supabase.auth.getUser();

      if (signedInUser) {
        const userProfile = await fetchUserProfile(supabase, signedInUser.id);
        router.push(userProfile?.role ? next : AUTH_ROLE);
      } else {
        router.push(next);
      }
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSelectAccount(account: { email: string; password: string }) {
    void signIn(account.email, account.password);
  }

  if (!isSupabaseAuth) {
    return null;
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        label="Institutional access"
        title="Select a role"
        subtitle="Choose a sandbox role to enter the Treasury Control Center. No credentials required."
      />

      <Card variant="elevated">
        <DemoAccountsPanel onSelectAccount={handleSelectAccount} />
        {submitting ? (
          <p className="mt-3 text-xs text-ops-text-secondary">Authenticating…</p>
        ) : null}
        {error ? <p className="mt-3 text-xs text-ops-danger">{error}</p> : null}
      </Card>

      <p className="text-center text-xs text-ops-text-secondary">
        <Link href={ACCESS_PORTAL} className="font-medium text-ops-primary hover:underline">
          ← Return to {ACCESS_PORTAL_TITLE}
        </Link>
      </p>
    </div>
  );
}
