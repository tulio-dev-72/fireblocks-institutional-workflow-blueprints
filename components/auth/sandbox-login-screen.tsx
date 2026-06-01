"use client";

import { getSandboxAccountForRole } from "@/data/sandbox-roles";
import { getRoleLabel } from "@/lib/auth/role-labels";
import type { UserRole } from "@/lib/types";

function CredentialRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-ops-border-subtle bg-ops-overlay/40 px-3 py-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ops-text-dim">
        {label}
      </span>
      <code className="font-mono text-xs text-ops-text">{value}</code>
    </div>
  );
}

export function SandboxLoginScreen({ role }: { role: UserRole }) {
  const account = getSandboxAccountForRole(role);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ops-bg px-4" role="status" aria-live="polite">
      <div className="w-full max-w-sm rounded-2xl border border-ops-border bg-ops-surface p-6 text-center shadow-[var(--ops-shadow-lg)]">
        <span
          className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-ops-border border-t-ops-primary"
          aria-hidden
        />
        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-ops-text-dim">
          Authenticating
        </p>
        <h1 className="mt-1.5 text-lg font-semibold tracking-tight text-ops-text">
          Signing in as {getRoleLabel(role)}
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-ops-text-secondary">
          Establishing a governed session against the Fireblocks sandbox.
        </p>

        <div className="mt-4 space-y-2 text-left">
          <CredentialRow label="Username" value={account.email} />
          <CredentialRow label="Password" value={account.password} />
        </div>

        <p className="mt-4 text-[10px] leading-relaxed text-ops-text-dim">
          Real Supabase authentication · sandbox demo credentials — not production access.
        </p>
      </div>
    </div>
  );
}
