import { NextResponse } from "next/server";

import { extractFireblocksApiErrorDetails } from "@/lib/fireblocks/errors";
import { requireFireblocksConfigured, requireFireblocksRole, TREASURY_OPS_ROLES } from "@/lib/fireblocks/route-utils";
import { fetchFireblocksVaultBalances } from "@/lib/fireblocks/service";

export async function GET() {
  const auth = await requireFireblocksRole(
    TREASURY_OPS_ROLES,
    "Vault balances require an authenticated operational role.",
  );
  if ("error" in auth) {
    return auth.error;
  }

  const unavailable = requireFireblocksConfigured();
  if (unavailable) {
    return unavailable;
  }

  try {
    const vaults = await fetchFireblocksVaultBalances();
    return NextResponse.json({ vaults });
  } catch (error) {
    console.error("[fireblocks/vaults] failed", extractFireblocksApiErrorDetails(error), error);
    return NextResponse.json(
      { error: "Failed to load Fireblocks vault balances." },
      { status: 502 },
    );
  }
}
