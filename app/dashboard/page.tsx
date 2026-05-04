import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ShareInvite from "./ShareInvite";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) redirect("/onboarding");

  const { count: rawCount } = await supabase
    .from("friend_submissions")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id);
  const submissionCount = rawCount ?? 0;

  const { data: latestDraft } = await supabase
    .from("profile_drafts")
    .select("id, created_at")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const ready = submissionCount >= 2;
  const live = profile.status === "live";

  return (
    <main className="min-h-screen px-6 py-8 max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-10">
        <Link href="/" className="font-display text-2xl tracking-tight">vouch</Link>
        <form action="/auth/signout" method="post">
          <button className="text-sm text-muted hover:text-ink">Sign out</button>
        </form>
      </header>

      {/* Header card */}
      <section className="card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
            {profile.photo_urls?.[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photo_urls[0]} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-muted">Welcome back</div>
            <div className="text-xl font-semibold truncate">{profile.display_name}</div>
            <StatusPill status={profile.status} />
          </div>
        </div>
      </section>

      {/* Step: collect */}
      <section className="card p-6 mb-4">
        <div className="flex items-start gap-3 mb-4">
          <Step n={1} done={submissionCount >= 2} />
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Collect 2–3 friend vouches</h2>
            <p className="text-muted text-sm">
              {submissionCount === 0
                ? "Send the link below to a few friends. They each take 60 seconds."
                : submissionCount === 1
                ? "1 vouch in. Get at least 1 more for the best blend."
                : `${submissionCount} vouches in — looking great.`}
            </p>
          </div>
        </div>
        <ShareInvite slug={profile.invite_slug} displayName={profile.display_name} />
      </section>

      {/* Step: synthesize */}
      <section className="card p-6 mb-4">
        <div className="flex items-start gap-3">
          <Step n={2} done={!!latestDraft} disabled={!ready} />
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Generate your profile</h2>
            <p className="text-muted text-sm mb-3">
              {ready
                ? latestDraft
                  ? "Draft ready to review."
                  : "Looks like you've got enough vouches. Stitch them into a profile."
                : "Unlocks at 2 vouches."}
            </p>
            <Link
              href="/review"
              className={ready ? "btn-primary" : "btn-secondary pointer-events-none opacity-50"}
              aria-disabled={!ready}
            >
              {latestDraft ? "Review draft →" : "Generate draft"}
            </Link>
          </div>
        </div>
      </section>

      {/* Step: live */}
      <section className="card p-6">
        <div className="flex items-start gap-3">
          <Step n={3} done={live} disabled={!live} />
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Go live</h2>
            <p className="text-muted text-sm mb-3">
              {live ? "You're discoverable. Browse other profiles." : "Approve your draft to publish."}
            </p>
            <Link
              href="/discover"
              className={live ? "btn-primary" : "btn-secondary pointer-events-none opacity-50"}
              aria-disabled={!live}
            >
              Open discover →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Step({ n, done, disabled }: { n: number; done?: boolean; disabled?: boolean }) {
  const cls = done
    ? "bg-accent text-white"
    : disabled
    ? "bg-white/5 text-muted"
    : "bg-white/10 text-ink";
  return (
    <div className={`w-7 h-7 rounded-full grid place-items-center text-xs font-semibold ${cls}`}>
      {done ? "✓" : n}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    draft: { label: "Setting up", cls: "bg-white/10 text-muted" },
    pending_friends: { label: "Waiting on friends", cls: "bg-accent2/20 text-accent2" },
    pending_review: { label: "Draft ready", cls: "bg-yellow-400/20 text-yellow-300" },
    live: { label: "Live", cls: "bg-emerald-400/20 text-emerald-300" },
    paused: { label: "Paused", cls: "bg-white/10 text-muted" },
  };
  const m = map[status] || map.draft;
  return (
    <span className={`inline-block mt-1 text-[11px] font-semibold rounded-full px-2 py-0.5 ${m.cls}`}>
      {m.label}
    </span>
  );
}
