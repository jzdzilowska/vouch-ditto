import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const Body = z.object({
  swiped_profile_id: z.string().uuid(),
  direction: z.enum(["like", "pass"]),
});

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Bad body" }, { status: 400 });
  }
  const b = parsed.data;

  // Insert swipe (unique on swiper+target). The DB trigger auto-creates a
  // matches row when the swipe is reciprocal.
  const { error } = await supabase.from("swipes").upsert(
    {
      swiper_id: user.id,
      swiped_profile_id: b.swiped_profile_id,
      direction: b.direction,
    },
    { onConflict: "swiper_id,swiped_profile_id" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Did the trigger create a match for us? Check via admin (matches RLS only
  // allows participants — we are one, so this works either way).
  const admin = createAdminClient();
  const { data: target } = await admin
    .from("profiles")
    .select("user_id")
    .eq("id", b.swiped_profile_id)
    .maybeSingle();

  let matched = false;
  if (target?.user_id) {
    const a = user.id < target.user_id ? user.id : target.user_id;
    const c = user.id < target.user_id ? target.user_id : user.id;
    const { data: m } = await admin
      .from("matches")
      .select("id")
      .eq("user_a", a)
      .eq("user_b", c)
      .maybeSingle();
    matched = !!m;
  }

  return NextResponse.json({ ok: true, matched });
}
