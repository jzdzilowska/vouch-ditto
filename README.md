# vouch

A dating app where your **friends** write your profile.

You sign up and upload photos. You text 2–3 friends a link. Each friend opens an iMessage-style chat that asks them three pointed questions about you. Claude stitches their answers into a single bio. You review, tweak, and publish — then it's discoverable as a swipeable photo card with the friend-written bio on top.

## Stack

- **Next.js 14** (App Router, TypeScript, Tailwind, RSC + middleware)
- **Supabase** — Postgres + Auth + Storage (photos) + RLS
- **Anthropic Claude** (`claude-sonnet-4-6`) for the friend-vouches → bio pipeline
- **framer-motion** for the swipe deck and photo carousel
- **zod** for API validation

## How the flow works

1. **Sign up** → `/signup` (email + password)
2. **Onboard** → `/onboarding` — 2-step wizard, upload 3-6 photos and basic info; an `invite_slug` is generated
3. **Dashboard** → `/dashboard` — copy the invite link or "Send via iMessage" (real `sms:` URL scheme prefills the user's Messages app)
4. **Friend submits** → `/friend/[slug]` opens an iMessage-styled chat that walks the friend through 5 turns: name, relationship, then 3 questions
5. **Synthesize** → `/api/synthesize` calls Claude with the latest 3 vouches and writes a `profile_drafts` row
6. **Review** → `/review` — preview card, edit, regenerate, or approve
7. **Discover** → `/discover` — swipeable card stack of other live profiles. Tap left/right halves to flip photos. Like/Pass buttons record swipes; a DB trigger creates a `matches` row on reciprocal likes
8. **Demo SMS outbox** → `/admin/sms` — every text the (mock) provider would have sent

## Architecture notes

- **Auth**: `@supabase/ssr` with browser, server-RSC, and middleware clients
- **RLS**: profiles are owner-write / live-read; friend submissions are insert-anyone, owner-read; swipes/matches scoped to participant
- **SMS abstraction**: `lib/sms/{types,mock,twilio,index}.ts`. Mock by default; `SMS_PROVIDER=twilio` flips to real sends with `TWILIO_*` env vars. Mock writes to `sms_outbox` so you can demo the full flow without paying for a Twilio number
- **Synthesis prompt** lives in `lib/synthesize.ts` — pure function, easy to unit test or A/B
- **Match-creation trigger** is in the SQL migration so reciprocal likes can never miss

## Quickstart

See [SETUP.md](./SETUP.md) for full step-by-step setup including Supabase, Anthropic key, and migration.

```bash
npm install
cp .env.local.example .env.local   # then fill in keys
npm run dev
```

Open http://localhost:3000.
