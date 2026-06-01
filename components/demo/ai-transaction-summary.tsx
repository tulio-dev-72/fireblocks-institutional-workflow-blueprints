"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  buildTransactionBriefingContext,
  type BriefingVerdict,
} from "@/lib/ai/transaction-briefing";
import type { PolicySettings, Transfer } from "@/lib/types";

const COMMAND_CENTER_URL = "https://fireblocks-trusted-ai-command-cente.vercel.app/";

const VERDICT_STYLES: Record<BriefingVerdict, { badge: string; dot: string }> = {
  authorize: {
    badge: "border-ops-success/30 bg-ops-success/10 text-ops-success",
    dot: "bg-ops-success",
  },
  review: {
    badge: "border-ops-warning/30 bg-ops-warning-muted/40 text-ops-warning",
    dot: "bg-ops-warning",
  },
  escalate: {
    badge: "border-ops-danger/30 bg-ops-danger-muted/40 text-ops-danger",
    dot: "bg-ops-danger",
  },
};

type AiTransactionSummaryProps = {
  transfer: Transfer;
  policy: PolicySettings;
};

export function AiTransactionSummary({ transfer, policy }: AiTransactionSummaryProps) {
  const context = useMemo(
    () => buildTransactionBriefingContext(transfer, policy),
    [transfer, policy],
  );
  const [narrative, setNarrative] = useState("");
  const [status, setStatus] = useState<"loading" | "streaming" | "done" | "error">("loading");
  const [nonce, setNonce] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    let accumulated = "";

    async function run() {
      setNarrative("");
      setStatus("loading");
      try {
        const res = await fetch("/api/ai/transaction-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transfer, policy }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          setNarrative(context.fallbackNarrative);
          setStatus("done");
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        setStatus("streaming");

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setNarrative(accumulated);
        }

        if (!accumulated.trim()) {
          setNarrative(context.fallbackNarrative);
        }
        setStatus("done");
      } catch {
        if (controller.signal.aborted) return;
        setNarrative(context.fallbackNarrative);
        setStatus("error");
      }
    }

    void run();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transfer.id, nonce]);

  const verdictStyle = VERDICT_STYLES[context.verdict];
  const isStreaming = status === "loading" || status === "streaming";

  return (
    <div className="rounded-xl border border-ops-info/25 bg-ops-info-muted/15 p-4 shadow-[var(--ops-shadow-sm)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-ops-info/15 text-ops-info">
            <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor" aria-hidden>
              <path d="M10 1.5l1.6 4.4 4.4 1.6-4.4 1.6L10 13.5 8.4 9.1 4 7.5l4.4-1.6L10 1.5z" />
            </svg>
          </span>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ops-info">
            AI Transaction Summary
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${verdictStyle.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${verdictStyle.dot}`} aria-hidden />
          {context.verdictLabel}
        </span>
      </div>

      <p className="mt-3 min-h-[2.5rem] text-xs leading-relaxed text-ops-text">
        {narrative}
        {isStreaming ? (
          <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-ops-info align-middle" aria-hidden />
        ) : null}
      </p>

      <dl className="mt-3 grid gap-1.5 border-t border-ops-info/15 pt-3">
        {context.facts.map((fact) => (
          <div key={fact.label} className="flex items-start justify-between gap-3">
            <dt className="text-[11px] font-medium text-ops-text-secondary">{fact.label}</dt>
            <dd className="min-w-0 break-words text-right text-[11px] font-semibold text-ops-text">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-ops-info/15 pt-2.5">
        <span className="text-[10px] text-ops-text-dim">Grounded in live Fireblocks data · powered by AI Gateway</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setNonce((value) => value + 1)}
            disabled={isStreaming}
            className="text-[11px] font-semibold text-ops-info transition hover:underline disabled:opacity-40"
          >
            Regenerate
          </button>
          <a
            href={COMMAND_CENTER_URL}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-semibold text-ops-info transition hover:underline"
          >
            Investigate in Command Center →
          </a>
        </div>
      </div>
    </div>
  );
}
