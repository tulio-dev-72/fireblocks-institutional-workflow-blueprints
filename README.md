# Treasury Control Center

Mobile-first institutional treasury operations prototype — high-value USDC settlement authorization with Fireblocks custody integration and Supabase Auth.

## Local development

```bash
cd institutional-workflow-blueprints
npm install
cp .env.example .env.local   # optional: Supabase + Fireblocks
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Supabase env vars, the app runs in **Demo Mode** (role buttons at `/demo/login`). See [docs/SUPABASE.md](docs/SUPABASE.md) and [docs/FIREBLOCKS.md](docs/FIREBLOCKS.md).

## Deploy (Vercel)

This app lives in a subdirectory of the incubator repo. In Vercel:

1. Import [health-sciences-coco-skills-incubator](https://github.com/tulio-dev-72/health-sciences-coco-skills-incubator)
2. Set **Root Directory** to `institutional-workflow-blueprints`
3. Add environment variables from `.env.example` (Supabase required for production auth)
4. Enable **Web Analytics** and **Speed Insights** in the Vercel project dashboard
5. Deploy

Or from this directory:

```bash
npx vercel --prod
```

### Analytics

- Packages: `@vercel/analytics`, `@vercel/speed-insights` (mounted in `app/layout.tsx`)
- Custom events: `lib/analytics.ts` via `trackProductEvent()` — role slugs and workflow metadata only; no secrets or transaction payloads
- Tracked events: `homepage_viewed`, `operations_page_viewed`, `demo_login`, `demo_dashboard_viewed`, `settlement_created`, `approval_action`, `policy_page_viewed`, `fireblocks_status_checked`
