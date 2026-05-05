import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const enabled =
    process.env.NODE_ENV !== "production" ||
    process.env.ENABLE_PRESENTATION_TOOLS === "true";
  if (!enabled) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profile, error: profileErr } = await admin
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileErr || !profile) {
    return NextResponse.json({ error: "profile not found" }, { status: 404 });
  }

  // Reset to a deterministic presentation set.
  const { error: deleteErr } = await admin
    .from("friend_submissions")
    .delete()
    .eq("profile_id", profile.id);
  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 });
  }

  const samples = [
    {
      profile_id: profile.id,
      friend_name: "Maya",
      friend_relationship: "college best friend",
      q1_three_words: "magnetic, thoughtful, hilarious",
      q2_perfect_date: "Natural wine bar, long walk, then dumplings at midnight.",
      q3_secret_strength:
        "She makes people feel completely seen within five minutes.",
    },
    {
      profile_id: profile.id,
      friend_name: "Ethan",
      friend_relationship: "coworker turned close friend",
      q1_three_words: "curious, loyal, grounded",
      q2_perfect_date: "Farmer's market, cooking together, cozy movie after.",
      q3_secret_strength:
        "In chaos, they're the calm center everyone trusts.",
    },
    {
      profile_id: profile.id,
      friend_name: "Noa",
      friend_relationship: "friend from travel group",
      q1_three_words: "adventurous, warm, intentional",
      q2_perfect_date:
        "Sunset picnic by the water and a spontaneous live music spot.",
      q3_secret_strength:
        "They remember tiny details and turn them into thoughtful moments.",
    },
  ];

  const { error: insertErr } = await admin
    .from("friend_submissions")
    .insert(samples);
  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, inserted: samples.length });
}

