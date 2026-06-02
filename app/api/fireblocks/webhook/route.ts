import { NextResponse } from "next/server";
import {
  getWebhookEndpointOrigin,
  handleFireblocksWebhookEvent,
} from "@/lib/fireblocks/webhook-events";
import { verifyFireblocksWebhook } from "@/lib/fireblocks/webhook-verify";

export const runtime = "nodejs";

/** @deprecated Use POST /api/webhooks/fireblocks */
export async function POST(request: Request) {
  const rawBody = Buffer.from(await request.arrayBuffer());
  const v2Signature = request.headers.get("fireblocks-webhook-signature");
  const legacySignature =
    request.headers.get("fireblocks-signature") ??
    request.headers.get("Fireblocks-Signature");

  const verification = await verifyFireblocksWebhook(rawBody, {
    v2Signature,
    legacySignature,
  });

  if (!verification.valid) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  try {
    const result = await handleFireblocksWebhookEvent(payload, { signatureValid: true });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to process webhook event.",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const origin = getWebhookEndpointOrigin(request);

  return NextResponse.json({
    endpoint: `${origin}/api/webhooks/fireblocks`,
    legacyEndpoint: `${origin}/api/fireblocks/webhook`,
    method: "POST",
    webhooksVersion: "v2",
    events: [
      "transaction.created",
      "transaction.status.updated",
      "transaction.approval_status.updated",
    ],
    setup:
      "Fireblocks Sandbox → Developer Center → Webhooks v2 → create webhook → set endpoint URL → subscribe to the transaction.* events.",
  });
}
