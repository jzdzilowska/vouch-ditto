-- vouch-ditto initial schema
-- Run in Supabase SQL editor (or via `supabase db push`)

-- 1. PROFILES ---------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade unique,
  display_name  text not null,
  age           int,
  city          text,
  gender        text,
  looking_for   text,
  invite_slug   text not null unique,
  bio           text,
  status        text not null default 'draft'
                check (status in ('draft','pending_friends','pending_review','live','paused')),
  photo_urls    text[] not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists profiles_status_idx on public.profiles(status);
create index if not exists profiles_invite_slug_idx on public.profiles(invite_slug);

-- 2. FRIEND SUBMISSIONS -----------------------------------------------------
create table if not exists public.friend_submissions (
  id                  uuid primary key default gen_random_uuid(),
  profile_id          uuid not null references public.profiles(id) on delete cascade,
  friend_name         text not null,
  friend_relationship text,
  q1_three_words      text not null,  -- "Three words to describe them"
  q2_perfect_date     text not null,  -- "Their perfect first date"
  q3_secret_strength  text not null,  -- "Something a date wouldn't notice but should"
  created_at          timestamptz not null default now()
);

create index if not exists friend_submissions_profile_idx on public.friend_submissions(profile_id);

-- 3. PROFILE DRAFTS (AI-synthesized) ----------------------------------------
create table if not exists public.profile_drafts (
  id                     uuid primary key default gen_random_uuid(),
  profile_id             uuid not null references public.profiles(id) on delete cascade,
  draft_bio              text not null,
  source_submission_ids  uuid[] not null default '{}',
  model                  text not null default 'claude-sonnet-4-6',
  created_at             timestamptz not null default now()
);

create index if not exists profile_drafts_profile_idx on public.profile_drafts(profile_id, created_at desc);

-- 4. SWIPES + MATCHES -------------------------------------------------------
create table if not exists public.swipes (
  id                 uuid primary key default gen_random_uuid(),
  swiper_id          uuid not null references auth.users(id) on delete cascade,
  swiped_profile_id  uuid not null references public.profiles(id) on delete cascade,
  direction          text not null check (direction in ('like','pass')),
  created_at         timestamptz not null default now(),
  unique (swiper_id, swiped_profile_id)
);

create index if not exists swipes_swiper_idx on public.swipes(swiper_id);
create index if not exists swipes_target_idx on public.swipes(swiped_profile_id);

create table if not exists public.matches (
  id          uuid primary key default gen_random_uuid(),
  user_a      uuid not null references auth.users(id) on delete cascade,
  user_b      uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  check (user_a < user_b),
  unique (user_a, user_b)
);

-- 5. RLS --------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.friend_submissions  enable row level security;
alter table public.profile_drafts      enable row level security;
alter table public.swipes              enable row level security;
alter table public.matches             enable row level security;

-- Profiles: owner can read/update; live profiles readable by all authed users
drop policy if exists "profiles_owner_all" on public.profiles;
create policy "profiles_owner_all" on public.profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "profiles_live_read" on public.profiles;
create policy "profiles_live_read" on public.profiles
  for select using (status = 'live');

-- Friend submissions: anyone can INSERT (looking up profile by slug via the API route).
-- Owner can SELECT their own. No update/delete.
drop policy if exists "friend_submissions_insert_any" on public.friend_submissions;
create policy "friend_submissions_insert_any" on public.friend_submissions
  for insert with check (true);

drop policy if exists "friend_submissions_owner_read" on public.friend_submissions;
create policy "friend_submissions_owner_read" on public.friend_submissions
  for select using (
    exists (select 1 from public.profiles p
            where p.id = friend_submissions.profile_id and p.user_id = auth.uid())
  );

-- Profile drafts: owner only
drop policy if exists "profile_drafts_owner" on public.profile_drafts;
create policy "profile_drafts_owner" on public.profile_drafts
  for all using (
    exists (select 1 from public.profiles p
            where p.id = profile_drafts.profile_id and p.user_id = auth.uid())
  );

-- Swipes: own only
drop policy if exists "swipes_owner" on public.swipes;
create policy "swipes_owner" on public.swipes
  for all using (auth.uid() = swiper_id) with check (auth.uid() = swiper_id);

-- Matches: visible to either party
drop policy if exists "matches_either" on public.matches;
create policy "matches_either" on public.matches
  for select using (auth.uid() = user_a or auth.uid() = user_b);

-- 6. STORAGE BUCKET FOR PHOTOS ---------------------------------------------
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

-- Owner-only write, public read
drop policy if exists "photos_public_read" on storage.objects;
create policy "photos_public_read" on storage.objects
  for select using (bucket_id = 'profile-photos');

drop policy if exists "photos_owner_write" on storage.objects;
create policy "photos_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "photos_owner_update" on storage.objects;
create policy "photos_owner_update" on storage.objects
  for update using (
    bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "photos_owner_delete" on storage.objects;
create policy "photos_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 7. updated_at trigger -----------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- 8. MATCH-ON-LIKE trigger --------------------------------------------------
-- When a like creates a reciprocal pair, insert into matches.
create or replace function public.maybe_create_match()
returns trigger language plpgsql security definer as $$
declare
  other_user uuid;
  this_user  uuid := new.swiper_id;
begin
  if new.direction <> 'like' then return new; end if;

  select user_id into other_user from public.profiles where id = new.swiped_profile_id;
  if other_user is null then return new; end if;

  if exists (
    select 1 from public.swipes s
    join public.profiles p on p.id = s.swiped_profile_id
    where s.swiper_id = other_user and p.user_id = this_user and s.direction = 'like'
  ) then
    insert into public.matches(user_a, user_b)
    values (least(this_user, other_user), greatest(this_user, other_user))
    on conflict do nothing;
  end if;
  return new;
end $$;

drop trigger if exists swipes_maybe_match on public.swipes;
create trigger swipes_maybe_match after insert on public.swipes
  for each row execute function public.maybe_create_match();
