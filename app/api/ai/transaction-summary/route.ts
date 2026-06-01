import { streamText } from "ai";
import { NextResponse } from "next/server";

import {
  buildBriefingPrompt,
  buildTransactionBriefingContext,
  type TreasuryLiveContext,
} from "@/lib/ai/transaction-briefing";
import { isFireblocksConfigured } from "@/lib/fireblocks/config";
import { requireFireblocksRole, TREASURY_OPS_ROLES } from "@/lib/fireblocks/route-utils";
import { getTreasuryMainFundingInfo } from "@/lib/fireblocks/service";
import type { PolicySettings, Transfer } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const DEFAULT_MODEL = process.env.AI_TX_SUMMARY_MODEL ?? "anthropic/claude-sonnet-4.6";

function aiEnabled(): boolean {
  // AI Gateway authenticates via OIDC automatically on Vercel deployments,
  // or via an explicit API key locally.
  return Boolean(process.env.AI_GATEWAY_API_KEY) || process.env.VERCEL === "1";
}

async function loadLiveContext(): Promise<TreasuryLiveContext> {
  if (!isFireblocksConfigured()) return null;
  try {
    const funding = await Promise.race([
      getTreasuryMainFundingInfo(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 4000)),
    ]);
    return {
      vaultName: funding.vaultName,
      assetLabel: funding.assetLabel,
      available: funding.available,
      fundingStatus: funding.fundingStatus,
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const auth = await requireFireblocksRole(TREASURY_OPS_ROLES);
  if ("error" in auth) {
    return auth.error;
  }

  let body: { transfer?: Transfer; policy?: PolicySettings };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { transfer, policy } = body;
  if (!transfer || !policy) {
    return NextResponse.json({ error: "transfer and policy are required." }, { status: 400 });
  }

  const live = await loadLiveContext();
  const context = buildTransactionBriefingContext(transfer, policy, live);

  if (!aiEnabled()) {
    return new Response(context.fallbackNarrative, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const { system, prompt } = buildBriefingPrompt(transfer, context);

  const result = streamText({
    model: DEFAULT_MODEL,
    system,
    prompt,
    temperature: 0.3,
    onError: (error) => {
      console.error("[ai/transaction-summary] stream error", error);
    },
  });

  return result.toTextStreamResponse();
}
