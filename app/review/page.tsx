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

  return (
    <main className="phone-edge-to-edge relative w-full min-h-[100dvh] bg-[#0c0805] text-ink overflow-hidden">
      {/* warm soft glow at the top */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -120, left: -40, right: -40, height: 380,
          background: "radial-gradient(ellipse 60% 70% at 50% 40%, rgba(210,136,101,0.35) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div className="hero-grain" style={{ opacity: 0.08 }} />

      <Link
        href="/dashboard"
        className="absolute z-10 text-white/60 hover:text-white text-2xl"
        style={{ top: 60, left: 16, padding: 8 }}
        aria-label="Back"
      >
        ‹
      </Link>

      <div className="relative z-[3] flex flex-col px-[26px]" style={{ paddingTop: 92, paddingBottom: 30 }}>
        <div className="eyebrow">step 4 of 4 · review</div>
        <h1
          className="mt-3.5 text-white"
          style={{
            fontFamily: "var(--font-display), 'Fraunces', serif",
            fontWeight: 300,
            fontSize: 34,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
          }}
        >
          Your profile,{" "}
          <em
            style={{
              fontFamily: "var(--font-italic), 'Instrument Serif', serif",
              fontWeight: 400,
              fontStyle: "italic",
            }}
          >
            in their words
          </em>
          .
        </h1>
        <p className="mt-3 text-white/55" style={{ fontSize: 13.5, lineHeight: 1.5 }}>
          Edit any line, regenerate, or publish.
        </p>

        {/* What friends said — collapsible vouch cards */}
        <section className="mt-6 mb-5">
          <div className="eyebrow opacity-70 mb-3">
            {submissionCount} vouch{submissionCount === 1 ? "" : "es"}
          </div>
          <div className="flex flex-col gap-2">
            {subs?.map((s) => (
              <details
                key={s.id}
                className="rounded-2xl px-4 py-3"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <summary className="cursor-pointer flex items-center justify-between list-none">
                  <span className="text-[15px] text-white">{s.friend_name}</span>
                  <span
                    className="text-white/50"
                    style={{
                      fontFamily: "var(--font-typewriter), monospace",
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    {s.friend_relationship || "friend"}
                  </span>
                </summary>
                <dl className="mt-3 flex flex-col gap-2 text-[13px]">
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
      </div>
    </main>
  );
}

function DLRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 items-start">
      <dt
        className="pt-0.5 text-white/45"
        style={{
          fontFamily: "var(--font-typewriter), monospace",
          fontSize: 9.5,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </dt>
      <dd className="text-white/85">{children}</dd>
    </div>
  );
}
