import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import FriendChat from "./FriendChat";

export const dynamic = "force-dynamic";

export default async function FriendPage({ params }: { params: { slug: string } }) {
  // Public route — use admin to look up profile by invite_slug (bypasses RLS).
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, display_name, photo_urls, status")
    .eq("invite_slug", params.slug)
    .maybeSingle();

  if (!profile) notFound();

  return (
    <FriendChat
      profileId={profile.id}
      displayName={profile.display_name}
      avatarUrl={profile.photo_urls?.[0] ?? null}
    />
  );
}
