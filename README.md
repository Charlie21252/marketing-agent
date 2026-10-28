# Adam Agent

Finds local businesses with **weak marketing** and tells you what to sell them: websites, social media setup, Google profile cleanup, logos, business cards, flyers, signage.

Built on the same agent pipeline as LeadFlow, but it audits a business's whole marketing footprint instead of just its website.

## Run it

```bash
npm install
npm run dev     # → http://localhost:3001
```

It runs on port **3001** so it can sit next to LeadFlow (3000). The first page load takes ~30–60s while Next.js compiles.

## Demo mode vs real searches

`.env.local` starts with `DEMO_MODE=true`: the dashboard shows 5 fictional leads and nothing calls a paid API.

To run real searches, set `DEMO_MODE=false` and restart. Each lead found costs:
- 1 Google Places text search page (with rating/photos/hours fields — the higher-priced tier)
- 2 Serper searches (owner + social pages)
- 1 Claude call (pitch angle), plus 1 more each time you click **Draft Email**

Leads are saved in their own MongoDB database (`MONGODB_DB`, default `adam-agent`), separate from LeadFlow's.

## Environment variables

| Name | What it's for |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `MONGODB_DB` | Database name (default `adam-agent`) |
| `ANTHROPIC_API_KEY` | Claude — pitch angles and email drafts |
| `GOOGLE_MAPS_API_KEY` | Google Places API (New) |
| `SERPER_API_KEY` | Google search via Serper — owner name and social pages |
| `SENDER_NAME` | Name used to sign emails and the call script (default `Adam`) |
| `DEMO_MODE` | `true` = sample data only |

## How it works

1. **Agent 1 — Find** (`app/api/agents/find-leads/route.ts`): Google Places + OpenStreetMap search, removes chains and closed businesses.
2. **Agent 2 — Research** (`lib/agents/research.ts`): audits five channels:
   - **Website** (`lib/audit/website.ts`) — exists, loads, mobile, HTTPS, contact/booking, outdated
   - **Social media** (`lib/audit/social.ts`) — Facebook/Instagram/TikTok/etc. from site links + Google search, follower counts when visible
   - **Google profile** — photos, reviews, rating, hours, description
   - **Branding** — logo, site icon, share image
   - **Promo & print** — coupons/specials/flyers/PDFs, newsletter signup, "Book now" call to action
3. **Scoring** (`lib/scorer.ts`): 0–100 (website 25, social 25, Google 20, branding 15, promo 15). **Lower = weaker marketing = better lead.** Businesses above 55 are skipped. It also picks up to 4 services to pitch, biggest gap first.
4. **Agent 3 — Pitch** (`lib/agents/format.ts`): Claude writes a 1–2 sentence pitch angle and the lead is saved.
5. **Outreach** (`app/api/outreach/route.ts`): Claude drafts a short cold email on demand.

Print materials (business cards, flyers) can't be seen online, so they're inferred: no logo or brand assets online usually means no professional print either.

Website checks use Playwright if Chromium is installed (`npx playwright install chromium`), otherwise a plain HTTP fetch.
