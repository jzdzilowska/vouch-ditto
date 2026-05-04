import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Deck from "./Deck";
import type { ProfileCardData } from "@/components/ProfileCard";

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/discover");

  // What has the current user already swiped on?
  const { data: prior } = await supabase
    .from("swipes")
    .select("swiped_profile_id")
    .eq("swiper_id", user.id);
  const seen = new Set((prior ?? []).map((p) => p.swiped_profile_id));

  // Live profiles excluding self.
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, age, city, bio, photo_urls, user_id")
    .eq("status", "live")
    .neq("user_id", user.id);

  const candidates = (profiles ?? []).filter((p) => !seen.has(p.id));

  // Pull friend names per candidate (max 3) to drive the "vouched by" footer.
  const ids = candidates.map((c) => c.id);
  const friendNamesByProfile = new Map<string, string[]>();
  if (ids.length) {
    const { data: subs } = await supabase
      .from("friend_submissions")
      .select("profile_id, friend_name, created_at")
      .in("profile_id", ids)
      .order("created_at", { ascending: true });
    for (const s of subs ?? []) {
      const arr = friendNamesByProfile.get(s.profile_id) ?? [];
      if (arr.length < 3) arr.push(firstName(s.friend_name));
      friendNamesByProfile.set(s.profile_id, arr);
    }
  }

  const cards: ProfileCardData[] = candidates.map((p) => ({
    id: p.id,
    display_name: p.display_name,
    age: p.age,
    city: p.city,
    bio: p.bio,
    photo_urls: p.photo_urls ?? [],
    vouchedBy: friendNamesByProfile.get(p.id) ?? [],
  }));

  // Recent matches for top-bar nudge
  const { data: matches } = await supabase
    .from("matches")
    .select("id, user_a, user_b, created_at")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(1);

  return (
    <main className="min-h-screen px-5 py-5 max-w-md mx-auto flex flex-col">
      <header className="flex items-center justify-between mb-5">
        <Link href="/dashboard" className="text-sm text-muted hover:text-ink">‹ Dashboard</Link>
        <span className="font-display text-xl tracking-tight">vouch</span>
        <Link href="/admin/sms" className="text-sm text-muted hover:text-ink" title="SMS outbox (demo)">📨</Link>
      </header>

      {matches && matches.length > 0 && (
        <div className="mb-3 text-center text-xs text-emerald-300/90 bg-emerald-300/10 border border-emerald-300/20 rounded-full px-3 py-1.5">
          You have a match. Check back later.
        </div>
      )}

      {cards.length === 0 ? (
        <EmptyState />
      ) : (
        <Deck cards={cards} />
      )}
    </main>
  );
}

function firstName(s: string) {
  return s.trim().split(/\s+/)[0];
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
      <div className="text-5xl mb-3">∅</div>
      <h2 className="text-xl font-semibold mb-1">You're all caught up.</h2>
      <p className="text-muted text-sm max-w-xs">
        No new profiles right now. Pull down to refresh, or invite a friend to join.
      </p>
    </div>
  );
}
