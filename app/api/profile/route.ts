import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { newInviteSlug } from "@/lib/slug";

const Body = z.object({
  display_name: z.string().min(1).max(60),
  age: z.number().int().min(18).max(99).nullable().optional(),
  city: z.string().max(80).optional().default(""),
  gender: z.string().max(40).optional().default(""),
  looking_for: z.string().max(40).optional().default(""),
  photo_urls: z.array(z.string().url()).min(3).max(6),
});

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Try insert with retry on slug collision
  let slug = newInviteSlug();
  for (let i = 0; i < 4; i++) {
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        display_name: parsed.data.display_name,
        age: parsed.data.age ?? null,
        city: parsed.data.city || null,
        gender: parsed.data.gender || null,
        looking_for: parsed.data.looking_for || null,
        photo_urls: parsed.data.photo_urls,
        invite_slug: slug,
        status: "pending_friends",
      })
      .select()
      .single();
    if (!error) return NextResponse.json({ profile: data });
    if (error.code === "23505") { slug = newInviteSlug(); continue; }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ error: "could not generate unique slug" }, { status: 500 });
}

export async function PATCH(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const json = await request.json().catch(() => null) as any;
  const updates: Record<string, unknown> = {};
  if (typeof json?.bio === "string") updates.bio = json.bio;
  if (typeof json?.status === "string") updates.status = json.status;
  if (Array.isArray(json?.photo_urls)) updates.photo_urls = json.photo_urls;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "no updates" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ profile: data });
}
