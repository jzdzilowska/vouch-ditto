# Setup

End-to-end run instructions. Allow ~15 min.

## 1. Install deps

```bash
npm install
```

## 2. Supabase project

1. Create a project at https://supabase.com/dashboard (free tier is fine)
2. Project Settings → API. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, never ship to client)

### Run the migration

In the Supabase dashboard → SQL Editor, paste and run, in order:

1. `supabase/migrations/0001_init.sql` — profiles, friend_submissions, profile_drafts, swipes, matches, RLS, the `profile-photos` storage bucket, and the reciprocal-like trigger
2. `supabase/migrations/0002_sms_outbox.sql` — the demo SMS outbox table

Or with the Supabase CLI:

```bash
supabase db push
```

### Disable email confirmation (for local dev)

Auth → Providers → Email → toggle off **Confirm email** so signups go straight through. Re-enable for production.

## 3. Anthropic API key

1. Get a key at https://console.anthropic.com → API Keys
2. Set `ANTHROPIC_API_KEY=sk-ant-…` in `.env.local`

## 4. .env.local

```bash
cp .env.local.example .env.local
```

Fill in:

```ini
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 5. Run

```bash
npm run dev
```

Open http://localhost:3000 → sign up → onboarding → dashboard → grab your invite link → open it in another browser/incognito to play the friend chat → back to dashboard → "Generate draft" → /review → "Approve & go live" → /discover.

## 6. (Optional) Real SMS via Twilio

The friend-submit flow runs entirely in the browser (mocked SMS), but to enable real text notifications when a friend submits a vouch:

1. Sign up at https://www.twilio.com, buy a phone number (~$1/mo), grab Account SID + Auth Token
2. Add to `.env.local`:
   ```ini
   SMS_PROVIDER=twilio
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_FROM_NUMBER=+15555550100
   ```
3. For the user's `to` field, swap the mock id for a real phone column on `profiles` (left as an exercise — schema doesn't currently store phone)

The provider is wired in `lib/sms/index.ts` — flipping `SMS_PROVIDER` is the only change needed.

## 7. Demo without a Twilio account

Already works out of the box. Visit `/admin/sms` to see what the mock provider would have sent — it writes every "outbound" SMS to the `sms_outbox` table for inspection.

## Project structure

```
app/
  page.tsx                       # landing
  signup, login, auth/           # @supabase/ssr auth
  onboarding/                    # photo upload + basics
  dashboard/                     # 3-step home + share link
  friend/[slug]/                 # iMessage-style chat (public)
  review/                        # edit & approve AI draft
  discover/                      # swipe deck
  admin/sms/                     # mock SMS outbox viewer
  api/
    profile/                     # POST/PATCH profile
    friend/submit/               # POST submit a vouch (no auth)
    synthesize/                  # POST trigger Claude synthesis
    swipe/                       # POST record a swipe
components/
  ProfileCard.tsx                # swipeable photo + bio overlay
lib/
  supabase/{client,server,admin,middleware,types}.ts
  sms/{types,mock,twilio,index}.ts
  synthesize.ts                  # Claude prompt + call
  slug.ts                        # invite slug generator
  site.ts                        # URL helpers
  anthropic.ts                   # SDK wrapper
supabase/migrations/             # 0001_init.sql, 0002_sms_outbox.sql
middleware.ts                    # session refresh + protected routes
```

## Troubleshooting

- **"new row violates row-level security policy" on photo upload** — make sure the `profile-photos` bucket exists and the storage policies in `0001_init.sql` ran. The folder name in the upload path must equal `auth.uid()`.
- **/dashboard redirects to /onboarding forever** — your insert into `profiles` is failing silently. Open browser devtools → Network → look at the `/api/profile` POST response.
- **Synthesize returns "No friend submissions yet"** — the `/friend/[slug]` chat needs to complete at least one full submission first.
- **Swipes don't create matches** — confirm trigger `swipes_maybe_match` exists in your DB (`select tgname from pg_trigger where tgname='swipes_maybe_match'`).
