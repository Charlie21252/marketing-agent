# Adam Agent — Project Context

Lead generator that finds local businesses with **weak marketing** (website, social media, Google profile, branding, promo/print) and suggests what to sell them: websites, social setup, Google profile cleanup, logos, business cards, flyers, signage. See README.md for the full rundown.

## Dev Server
```bash
npm run dev   # → http://localhost:3001
```
Port 3001 on purpose (LeadFlow, a separate project, uses 3000).

## Pipeline
1. `app/api/agents/find-leads/route.ts` — Agent 1: Google Places + OSM search, chain filter, checks DB before spending on APIs
2. `lib/agents/research.ts` — Agent 2: runs `lib/audit/website.ts` and `lib/audit/social.ts`, reads Google profile data, scores with `lib/scorer.ts`
3. `lib/agents/format.ts` — Agent 3: Claude pitch angle + save to MongoDB
4. `app/api/outreach/route.ts` — Claude cold email on demand

## Scoring
`marketingScore` 0–100: website 25, social 25, Google profile 20, branding 15, promo 15. Lower = weaker marketing = better lead. Leads above `MAX_LEAD_SCORE` (55) are skipped. Print materials can't be seen online, so they're inferred from missing brand assets.

## Notes
- `DEMO_MODE=true` serves fictional leads from `lib/demoData.ts` (run through the real scorer) and blocks paid API calls.
- MongoDB database name comes from `MONGODB_DB` (default `adam-agent`).
- `SENDER_NAME` signs emails and the call script.

## Stack
Next.js 14 (App Router) · TypeScript · Tailwind CSS · MongoDB + Mongoose · Anthropic SDK · Playwright (optional)
