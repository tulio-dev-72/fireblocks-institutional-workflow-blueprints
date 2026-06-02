import { createPublicKey, verify } from "crypto";
import { createRemoteJWKSet, compactVerify } from "jose";
import { getFireblocksBaseUrl, getFireblocksConfig } from "@/lib/fireblocks/config";

// Legacy (Webhooks v1) static public key for the Fireblocks Developer Sandbox.
// Used only as a fallback; Webhooks v2 validates via JWKS (see below).
const SANDBOX_WEBHOOK_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApZE6wL2+7P1ohvVYSpCd
gSgtmyGwiLbUC1UoGJhn1zwfY7ZWbNH7Pg8Osk8OzZTZHSG/arcgE8HnGCmGKtbE
QBkf2XlBRBQ01FcCMlZuJQJ3nElCPaMl9N6fq0VKNEIlVSVUpDCgvag5kFhDKS/L
p3YYJLFR46/hDlVLn+vM84diO3xGyMc16YJGNz7Z4jb8dmSZQE5E2XaQMDXW6uxC
c2ChjWJ3X5H70MzRG35JsN0j58SQTwbf4Pxm0aJfhPuaIBn3mJuZL5etsuFihoFG
FDnT+qWRcgD/pRNulBFAFhJeUnFrE4fFTJ1iaHhjBrStBCrxJk6QI0pGznoapTgA
QwIDAQAB
-----END PUBLIC KEY-----`;

// Webhooks v2 publishes signing keys as JWKS per environment. The kid in the
// detached-JWS header selects the key, so rotation is automatic.
const JWKS_ENDPOINTS = {
  sandbox: "https://sandbox-keys.fireblocks.io/.well-known/jwks.json",
  us: "https://keys.fireblocks.io/.well-known/jwks.json",
  eu: "https://eu-keys.fireblocks.io/.well-known/jwks.json",
  eu2: "https://eu2-keys.fireblocks.io/.well-known/jwks.json",
} as const;

type FireblocksEnv = keyof typeof JWKS_ENDPOINTS;

function resolveEnv(): FireblocksEnv {
  const basePath = (getFireblocksConfig()?.basePath ?? getFireblocksBaseUrl()).toLowerCase();
  if (basePath.includes("sandbox")) return "sandbox";
  if (basePath.includes("eu2")) return "eu2";
  if (basePath.includes("eu")) return "eu";
  return "us";
}

function isSandboxWorkspace(): boolean {
  return resolveEnv() === "sandbox";
}

// One cached remote JWKS per environment (jose handles HTTP caching + rotation).
const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJwks(): ReturnType<typeof createRemoteJWKSet> {
  const url = process.env.FIREBLOCKS_WEBHOOK_JWKS_URL ?? JWKS_ENDPOINTS[resolveEnv()];
  let set = jwksCache.get(url);
  if (!set) {
    set = createRemoteJWKSet(new URL(url));
    jwksCache.set(url, set);
  }
  return set;
}

/**
 * Webhooks v2 — validate the detached JWS in the `Fireblocks-Webhook-Signature`
 * header against the environment JWKS. The payload is sent separately (the raw
 * request body), so we reconstruct the compact JWS before verifying.
 */
export async function verifyFireblocksWebhookV2(
  rawBody: Buffer,
  signatureHeader: string | null,
): Promise<boolean> {
  if (!signatureHeader) return false;
  try {
    const [header, , sig] = signatureHeader.split(".");
    if (!header || !sig) return false;
    const payload = rawBody.toString("base64url");
    const fullJws = `${header}.${payload}.${sig}`;
    await compactVerify(fullJws, getJwks());
    return true;
  } catch {
    return false;
  }
}

/**
 * Legacy (Webhooks v1) — RSA-SHA512 over the raw body with a static public key,
 * sent in the `Fireblocks-Signature` header. Retained as a fallback.
 */
export function verifyFireblocksWebhookSignature(
  rawBody: Buffer,
  signatureHeader: string | null,
): boolean {
  if (!signatureHeader) {
    return false;
  }

  if (process.env.FIREBLOCKS_WEBHOOK_SKIP_VERIFY === "true") {
    return true;
  }

  try {
    const publicKey = createPublicKey(
      isSandboxWorkspace()
        ? SANDBOX_WEBHOOK_PUBLIC_KEY
        : (process.env.FIREBLOCKS_WEBHOOK_PUBLIC_KEY ?? SANDBOX_WEBHOOK_PUBLIC_KEY),
    );
    const signature = Buffer.from(signatureHeader, "base64");

    return verify("RSA-SHA512", rawBody, publicKey, signature);
  } catch {
    return false;
  }
}

/**
 * Combined verifier. Prefers Webhooks v2 (JWKS) when its header is present and
 * falls back to the legacy v1 signature, so the receiver works across the
 * migration window and after v1 is retired.
 */
export async function verifyFireblocksWebhook(
  rawBody: Buffer,
  headers: { v2Signature: string | null; legacySignature: string | null },
): Promise<{ valid: boolean; method: "v2" | "v1" | "skipped" | null }> {
  if (process.env.FIREBLOCKS_WEBHOOK_SKIP_VERIFY === "true") {
    return { valid: true, method: "skipped" };
  }

  if (headers.v2Signature && (await verifyFireblocksWebhookV2(rawBody, headers.v2Signature))) {
    return { valid: true, method: "v2" };
  }

  if (
    headers.legacySignature &&
    verifyFireblocksWebhookSignature(rawBody, headers.legacySignature)
  ) {
    return { valid: true, method: "v1" };
  }

  return { valid: false, method: null };
}
