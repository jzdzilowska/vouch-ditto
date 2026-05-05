import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProfileCard, { type ProfileCardData, type VouchExcerpt } from "@/components/ProfileCard";

export const dynamic = "force-dynamic";

// Personal profile preview — renders your card exactly in the public card style
// (same component used in discover), but in a single-card screen with a back
// affordance to dashboard.
export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, age, city, bio, photo_urls")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) redirect("/");

  const { data: subs } = await supabase
    .from("friend_submissions")
    .select("friend_name, friend_relationship, q2_perfect_date, q3_secret_strength, created_at")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: true })
    .limit(3);

  const vouches: VouchExcerpt[] = (subs ?? []).map((s) => ({
    text:
      (s.q3_secret_strength?.length ?? 0) >= 24
        ? `"${s.q3_secret_strength}"`
        : `"${s.q2_perfect_date}"`,
    author: firstName(s.friend_name),
    relation: s.friend_relationship || null,
  }));

  const card: ProfileCardData = {
    id: profile.id,
    display_name: profile.display_name,
    age: profile.age,
    city: profile.city,
    bio: profile.bio,
    photo_urls: profile.photo_urls ?? [],
    vouches,
    vouchedBy: vouches.map((v) => v.author),
  };

  return (
    <main className="phone-edge-to-edge relative w-full h-full min-h-[100dvh] bg-black overflow-hidden">
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
      </div>

      <ProfileCard profile={card} />
    </main>
  );
}

function firstName(s: string) {
  return s.trim().split(/\s+/)[0];
}

