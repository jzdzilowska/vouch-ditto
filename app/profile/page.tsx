import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileView, { type ProfileViewVouch, type ProfileViewProfile } from "./ProfileView";

export const dynamic = "force-dynamic";

// Personal profile preview — single-screen view of "what your card looks
// like" to other people. Layout matches the redesign in
// profile-redesign.html (Variant A — Pages):
//   1. Full-bleed photo hero (fills the first screen, masthead-style)
//   2. Below it, an orb-molecule animated backdrop (the moving gradient
//      from onboarding) under the vouch-built sections — three-words
//      constellation, perfect-date carousel, secret-strength stack,
//      chosen-by credits, photo strip.
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
    .select(
      "friend_name, friend_relationship, q1_three_words, q2_perfect_date, q3_secret_strength, created_at"
    )
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: true })
    .limit(3);

  // Map raw friend_submissions rows into the ProfileView's richer shape
  // (one object per friend, with q1/q2/q3 carried through so each
  // section can pick the answer it needs).
  const vouches: ProfileViewVouch[] = (subs ?? []).map((s) => ({
    name: firstName(s.friend_name),
    relation: s.friend_relationship || null,
    q1: s.q1_three_words || "",
    q2: s.q2_perfect_date || "",
    q3: s.q3_secret_strength || "",
  }));

  const view: ProfileViewProfile = {
    id: profile.id,
    display_name: profile.display_name,
    age: profile.age,
    city: profile.city,
    bio: profile.bio,
    photo_urls: profile.photo_urls ?? [],
  };

  return <ProfileView profile={view} vouches={vouches} />;
}

function firstName(s: string) {
  return s.trim().split(/\s+/)[0];
}
