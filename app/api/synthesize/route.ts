import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { synthesizeBio } from "@/lib/synthesize";

// POST /api/synthesize
// Pulls the latest 3 friend submissions for the signed-in user's profile,
// runs them through Claude, persists a profile_drafts row, sets profile.status
// to 'pending_review'. Returns the draft for the /review page.
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("id, display_name, age, city, gender, looking_for, status")
    .eq("user_id", user.id)
    .maybeSingle();
  if (pErr || !profile) return NextResponse.json({ error: "No profile" }, { status: 404 });

  // Use the most recent 3 submissions. If we have only 1, still proceed
  // (lower quality but unblocks the demo); the dashboard already gates this
  // at 2+ for the recommended path.
  const { data: subs, error: sErr } = await supabase
    .from("friend_submissions")
    .select("id, friend_name, friend_relationship, q1_three_words, q2_perfect_date, q3_secret_strength")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(3);
  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });
  if (!subs || subs.length === 0) {
    return NextResponse.json(
      { error: "No friend submissions yet. Send your invite link first." },
      { status: 400 }
    );
  }

  let result;
  try {
    result = await synthesizeBio({ profile, submissions: subs });
  } catch (e: any) {
    console.error("synthesize error", e);
    return NextResponse.json(
      { error: e?.message ?? "Synthesis failed" },
      { status: 500 }
    );
  }

  // Save draft + update profile status.
  const { data: draft, error: dErr } = await supabase
    .from("profile_drafts")
    .insert({
      profile_id: profile.id,
      draft_bio: result.bio,
      source_submission_ids: subs.map((s) => s.id),
      model: result.model,
    })
    .select()
    .single();

  if (dErr) return NextResponse.json({ error: dErr.message }, { status: 500 });

  await supabase
    .from("profiles")
    .update({ status: "pending_review" })
    .eq("id", profile.id);

  return NextResponse.json({
    draft,
    usage: { input_tokens: result.input_tokens, output_tokens: result.output_tokens },
    source_count: subs.length,
  });
}
