-- SMS outbox: persists every outbound SMS attempt for the demo /admin/sms view.
-- The mock provider writes here; the Twilio provider can also log here in addition
-- to actual sends if you want a unified history.

create table if not exists public.sms_outbox (
  id          uuid primary key default gen_random_uuid(),
  provider    text not null default 'mock',
  to_number   text not null,
  body        text not null,
  meta        jsonb not null default '{}'::jsonb,
  status      text not null default 'sent' check (status in ('queued','sent','failed')),
  error       text,
  created_at  timestamptz not null default now()
);

create index if not exists sms_outbox_created_idx on public.sms_outbox(created_at desc);

alter table public.sms_outbox enable row level security;

-- For the demo, allow any signed-in user to read the outbox so the /admin/sms
-- page works. Tighten this in production.
drop policy if exists "sms_outbox_authed_read" on public.sms_outbox;
create policy "sms_outbox_authed_read" on public.sms_outbox
  for select using (auth.role() = 'authenticated');
