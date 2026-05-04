import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { smsProvider } from "@/lib/sms";

const Body = z.object({
  profile_id: z.string().uuid(),
  friend_name: z.string().min(1).max(60),
  friend_relationship: z.string().max(80).optional().default(""),
  q1_three_words: z.string().min(1).max(280),
  q2_perfect_date: z.string().min(1).max(280),
  q3_secret_strength: z.string().min(1).max(280),
});

// Public endpoint — anyone with a valid invite slug can submit. Rate-limit at
// the edge in production. Uses admin client because the friend isn't authed.
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid body" }, { status: 400 });
  }
  const b = parsed.data;

  const admin = createAdminClient();

  // Validate the profile is real + accepting submissions.
  const { data: profile, error: pErr } = await admin
    .from("profiles")
    .select("id, status, display_name, user_id")
    .eq("id", b.profile_id)
    .maybeSingle();

  if (pErr || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  if (profile.status === "paused") {
    return NextResponse.json({ error: "This profile isn't accepting vouches right now." }, { status: 403 });
  }

  const { data: inserted, error: insErr } = await admin
    .from("friend_submissions")
    .insert({
      profile_id: b.profile_id,
      friend_name: b.friend_name,
      friend_relationship: b.friend_relationship || null,
      q1_three_words: b.q1_three_words,
      q2_perfect_date: b.q2_perfect_date,
      q3_secret_strength: b.q3_secret_strength,
    })
    .select("id")
    .single();

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  // Notify the profile owner via SMS (mock by default; logs to /admin/sms).
  // Best-effort — don't fail the submit if SMS errors.
  try {
    await smsProvider().send({
      to: profile.user_id, // mock provider just labels by user id; Twilio would need real phone
      body: `${b.friend_name} just vouched for you on Vouch 💌 (${countMessage(profile.display_name)})`,
      meta: { kind: "submission_received", profile_id: profile.id, submission_id: inserted.id },
    });
  } catch (e) {
    console.warn("SMS notify failed:", e);
  }

  return NextResponse.json({ ok: true, id: inserted.id });
}

function countMessage(name: string) {
  return `tap to see what your friend said about ${name}`;
}
