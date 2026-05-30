# Treasury Control Center — dedicated Fireblocks API user

This app uses **its own** sandbox API credentials, separate from the Trusted AI Command Center.

## Generated locally

| File | Purpose |
|------|---------|
| `.secrets/fireblocks_treasury_secret.key` | Private key (keep local, never commit) |
| `.secrets/fireblocks_treasury.csr` | Upload to Fireblocks to create the API user |

## Finish setup in Fireblocks Sandbox (~2 min)

1. Open [sandbox.fireblocks.io](https://sandbox.fireblocks.io) → **Developer Center** → **API users**
2. **Add API user**
   - Name: `Treasury Control Center` (or similar)
   - Role: **Editor** or **Signer** (sandbox)
   - Upload: `institutional-workflow-blueprints/.secrets/fireblocks_treasury.csr`
3. Copy the new **API User ID** (UUID)
4. Paste into `.env.local`:
   ```bash
   FIREBLOCKS_API_KEY=<paste-uuid-here>
   ```
5. Restart the dev server: `npm run dev`
6. Verify: open the app → **Policy admin** or homepage infrastructure stats → **Fireblocks Connected**

## Vercel production

Add the same values in Vercel project env vars:

- `FIREBLOCKS_API_KEY` — UUID from step 3
- `FIREBLOCKS_PRIVATE_KEY` — contents of `fireblocks_treasury_secret.key` (use `\n` for newlines), **or** omit if you only use file path locally
- `FIREBLOCKS_BASE_URL=https://sandbox-api.fireblocks.io/v1`

Do not reuse the Trusted AI Command Center API user on this deployment.

## Rotate / revoke

To rotate: generate a new key pair, create a new API user in Fireblocks, update env vars, disable the old API user in the console.
