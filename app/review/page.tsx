import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import HeroBackdrop from "@/components/HeroBackdrop";
import GrainOverlay from "@/components/GrainOverlay";
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
  if (!profile) redirect("/");

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
  const spotlight = buildSpotlight(subs ?? [], profile.display_name);

  return (
    <main className="phone-edge-to-edge relative w-full h-full min-h-[100dvh] bg-black text-ink overflow-hidden">
      <HeroBackdrop />
      <GrainOverlay opacity={0.2} />

      <Link
        href="/dashboard"
        className="absolute z-10 text-white/60 hover:text-white text-2xl"
        style={{ top: 56, left: 16, padding: 8 }}
        aria-label="Back"
      >
        ‹
      </Link>

      <div className="review-shell">
        <h1 className="welcome-heading review-title">
          Your profile, <em>in their words.</em>
        </h1>
        <p className="review-subtitle">
          {submissionCount} vouch{submissionCount === 1 ? "" : "es"} in. Shape the final version.
        </p>

        <section className="review-hero-card">
          {profile.photo_urls?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.photo_urls[0]} alt={profile.display_name} className="review-hero-image" />
          ) : (
            <div className="review-hero-empty">add a main photo to preview this</div>
          )}
          <div className="review-hero-fade" />
          <div className="review-hero-overlay">
            <div className="review-hero-name">{profile.display_name}</div>
            <div className="review-hero-summary">“{spotlight}”</div>
          </div>
        </section>

        <section className="review-vouch-stack">
          {subs?.map((s) => (
            <details key={s.id} className="review-vouch-item">
              <summary className="review-vouch-head">
                <span className="review-vouch-name">{s.friend_name}</span>
                <span className="review-vouch-rel">{s.friend_relationship || "friend"}</span>
              </summary>
              <dl className="review-vouch-body">
                <DLRow label="3 words">{s.q1_three_words}</DLRow>
                <DLRow label="Perfect first date">{s.q2_perfect_date}</DLRow>
                <DLRow label="Hidden strength">{s.q3_secret_strength}</DLRow>
              </dl>
            </details>
          ))}
        </section>

        <ReviewClient
          initialDraftBio={latestDraft?.draft_bio ?? null}
          currentBio={profile.bio}
          currentStatus={profile.status}
          photoUrl={profile.photo_urls?.[0] ?? null}
          displayName={profile.display_name}
          canSynthesize={submissionCount >= 1}
        />
      </div>
    </main>
  );
}

function DLRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[96px_1fr] gap-3 items-start">
      <dt
        className="pt-0.5 text-white/40"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 11,
          letterSpacing: "-0.005em",
        }}
      >
        {label}
      </dt>
      <dd className="text-white/88 text-[13px] leading-[1.35]">{children}</dd>
    </div>
  );
}

function buildSpotlight(
  subs: Array<{
    friend_name: string;
    q1_three_words: string;
    q3_secret_strength: string;
  }>,
  displayName: string
) {
  if (!subs.length) return `${displayName} shows up exactly when it matters.`;

  const q3 = subs[0].q3_secret_strength?.trim();
  if (q3) {
    const cleaned = q3.replace(/\s+/g, " ").trim();
    return cleaned.length > 92 ? `${cleaned.slice(0, 89)}...` : cleaned;
  }

  const words = subs[0].q1_three_words?.trim();
  if (words) return `${displayName} feels ${words}.`;

  return `${displayName} is the kind of person people trust deeply.`;
}
