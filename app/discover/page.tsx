import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Deck from "./Deck";
import type { ProfileCardData, VouchExcerpt } from "@/components/ProfileCard";

export const dynamic = "force-dynamic";

// Discover — full-bleed swipe deck. Each card uses the new ProfileCard
// design (Stories-segmented photo carousel + Instrument Serif friend
// quotes + Fraunces name). The friend quote is pulled live from the
// most recent friend_submission and rotates between the three Q&A fields
// for variety. Pass/Like buttons sit at the bottom over a glass blur.
export default async function DiscoverPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/discover");

  // Already-swiped profiles
  const { data: prior } = await supabase
    .from("swipes")
    .select("swiped_profile_id")
    .eq("swiper_id", user.id);
  const seen = new Set((prior ?? []).map((p) => p.swiped_profile_id));

  // Live profiles excluding self
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, age, city, bio, photo_urls, user_id")
    .eq("status", "live")
    .neq("user_id", user.id);

  const candidates = (profiles ?? []).filter((p) => !seen.has(p.id));

  // Pull friend submissions for the visible candidates so we can build
  // VouchExcerpts (3 per profile, pulling from each Q&A field).
  const ids = candidates.map((c) => c.id);
  const vouchesByProfile = new Map<string, VouchExcerpt[]>();
  if (ids.length) {
    const { data: subs } = await supabase
      .from("friend_submissions")
      .select(
        "profile_id, friend_name, friend_relationship, q1_three_words, q2_perfect_date, q3_secret_strength, created_at"
      )
      .in("profile_id", ids)
      .order("created_at", { ascending: true });
    for (const s of subs ?? []) {
      const arr = vouchesByProfile.get(s.profile_id) ?? [];
      // Use q3 (the hidden-strength) as the highlight quote — it tends
      // to read best as a vouch ("the kind of person who…"). Falls
      // back to q2 if q3 is short.
      const text =
        (s.q3_secret_strength?.length ?? 0) >= 24
          ? s.q3_secret_strength
          : s.q2_perfect_date;
      arr.push({
        text: `"${text}"`,
        author: firstName(s.friend_name),
        relation: s.friend_relationship || null,
      });
      vouchesByProfile.set(s.profile_id, arr);
    }
  }

  const cards: ProfileCardData[] = candidates.map((p) => ({
    id: p.id,
    display_name: p.display_name,
    age: p.age,
    city: p.city,
    bio: p.bio,
    photo_urls: p.photo_urls ?? [],
    vouches: vouchesByProfile.get(p.id) ?? [],
    vouchedBy: (vouchesByProfile.get(p.id) ?? []).slice(0, 3).map((v) => v.author),
  }));

  // Recent matches surface as a tiny banner up top
  const { data: matches } = await supabase
    .from("matches")
    .select("id, user_a, user_b, created_at")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(1);

  return (
    <main className="phone-edge-to-edge relative w-full h-full min-h-[100dvh] bg-black overflow-hidden">
      {/* Top bar over the card */}
      <div
        className="absolute z-40 flex items-center justify-between px-3.5"
        style={{ top: 56, left: 0, right: 0, marginTop: 10 }}
      >
        <Link
          href="/dashboard"
          aria-label="Back"
          className="w-9 h-9 rounded-full backdrop-blur-md text-white text-lg flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          ‹
        </Link>
        <Link
          href="/admin/sms"
          aria-label="SMS outbox"
          className="w-9 h-9 rounded-full backdrop-blur-md text-white text-base flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
          title="SMS outbox (demo)"
        >
          ⋯
        </Link>
      </div>

      {matches && matches.length > 0 && (
        <div
          className="absolute z-40 px-3.5 py-1.5 text-[11px] text-emerald-200 rounded-full backdrop-blur-md"
          style={{
            top: 110,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(168,216,168,0.12)",
            border: "1px solid rgba(168,216,168,0.3)",
            fontFamily: "var(--font-typewriter), monospace",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          ✓ a match
        </div>
      )}

      {cards.length === 0 ? <EmptyState /> : <Deck cards={cards} />}
    </main>
  );
}

function firstName(s: string) {
  return s.trim().split(/\s+/)[0];
}

function EmptyState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
      <div className="hero-photo absolute inset-0">
        <div className="hero-art hero-dusk" />
        <div className="hero-grain" />
      </div>
      <div className="relative z-10">
        <div
          className="text-white"
          style={{
            fontFamily: "var(--font-display), 'Fraunces', serif",
            fontWeight: 300,
            fontSize: 32,
            letterSpacing: "-0.025em",
          }}
        >
          You&apos;re all{" "}
          <em
            style={{
              fontFamily: "var(--font-italic), 'Instrument Serif', serif",
              fontStyle: "italic",
            }}
          >
            caught up
          </em>
          .
        </div>
        <p className="text-white/55 text-sm mt-3 max-w-[280px] mx-auto leading-relaxed">
          No new profiles right now. Check back tomorrow, or share vouch with someone you&apos;d match with.
        </p>
      </div>
    </div>
  );
}
