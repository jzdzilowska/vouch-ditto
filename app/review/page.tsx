import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ReviewClient from "./ReviewClient";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/review");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) redirect("/onboarding");

  const { data: subs } = await supabase
    .from("friend_submissions")
    .select("id, friend_name, friend_relationship, q1_three_words, q2_perfect_date, q3_secret_strength, created_at")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: latestDraft } = await supabase
    .from("profile_drafts")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const submissionCount = subs?.length ?? 0;

  return (
    <main className="min-h-screen px-6 py-8 max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <Link href="/dashboard" className="text-sm text-muted hover:text-ink">‹ Dashboard</Link>
        <span className="text-xs text-muted uppercase tracking-widest">Review</span>
      </header>

      <h1 className="h-display mb-2">Your profile, in their words.</h1>
      <p className="text-muted mb-8">
        Edit any line, regenerate the whole thing, or publish.
      </p>

      {/* What friends said */}
      <section className="mb-6">
        <div className="text-sm text-muted mb-2">{submissionCount} vouch{submissionCount === 1 ? "" : "es"}</div>
        <div className="grid gap-2">
          {subs?.map((s) => (
            <details key={s.id} className="card p-4">
              <summary className="cursor-pointer flex items-center justify-between">
                <span className="font-semibold text-sm">{s.friend_name}</span>
                <span className="text-xs text-muted">
                  {s.friend_relationship || "friend"}
                </span>
              </summary>
              <dl className="mt-3 space-y-2 text-sm">
                <DLRow label="3 words">{s.q1_three_words}</DLRow>
                <DLRow label="Perfect first date">{s.q2_perfect_date}</DLRow>
                <DLRow label="Hidden strength">{s.q3_secret_strength}</DLRow>
              </dl>
            </details>
          ))}
        </div>
      </section>

      <ReviewClient
        initialDraftBio={latestDraft?.draft_bio ?? null}
        currentBio={profile.bio}
        currentStatus={profile.status}
        photoUrl={profile.photo_urls?.[0] ?? null}
        displayName={profile.display_name}
        canSynthesize={submissionCount >= 1}
      />
    </main>
  );
}

function DLRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 items-start">
      <dt className="text-muted text-[12px] uppercase tracking-wider pt-0.5">{label}</dt>
      <dd className="text-ink/90">{children}</dd>
    </div>
  );
}
