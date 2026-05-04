import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ShareInvite from "./ShareInvite";

export const dynamic = "force-dynamic";

// Dashboard — ported from the design's "InviteScreen". Warm dark surface
// with a soft glow at the top, a Fraunces "Ask 3 people who get you"
// headline, progress dots, friend list with status pills, and the
// invite-link preview + iMessage CTA at the bottom.
//
// Functionally identical to the previous 3-step dashboard: still gates
// the synthesize CTA at 2+ vouches, still shows live/draft/paused
// status, still posts to the same Supabase tables.
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

  // Pull each submission so we can show the friend rows with names + status.
  const { data: submissions } = await supabase
    .from("friend_submissions")
    .select("id, friend_name, friend_relationship, created_at")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: true });

  const submissionCount = submissions?.length ?? 0;

  const { data: latestDraft } = await supabase
    .from("profile_drafts")
    .select("id, created_at")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const ready = submissionCount >= 2;
  const live = profile.status === "live";

  // Map submissions → friend rows; show a few "invite" placeholder rows
  // until they reach the recommended 3-vouch target.
  type FriendRow = { name: string; relation: string; status: "vouched" | "pending" | "invite"; initials: string };
  const rows: FriendRow[] = (submissions ?? []).map((s) => ({
    name: s.friend_name,
    relation: s.friend_relationship || "friend",
    status: "vouched",
    initials: initialsOf(s.friend_name),
  }));
  while (rows.length < 3) {
    rows.push({ name: "—", relation: "send your link", status: "invite", initials: "+" });
  }

  return (
    <main className="phone-edge-to-edge relative w-full min-h-[100dvh] bg-[#0c0805] overflow-hidden text-ink">
      {/* warm soft glow at the top — connects visually to landing */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -120, left: -40, right: -40, height: 380,
          background: "radial-gradient(ellipse 60% 70% at 50% 40%, rgba(210,136,101,0.45) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div className="hero-grain" style={{ opacity: 0.08 }} />

      {/* sign out — top right, very subtle */}
      <form action="/auth/signout" method="post" className="absolute z-10" style={{ top: 60, right: 16 }}>
        <button className="text-[10px] tracking-[0.18em] uppercase text-white/45 hover:text-white/80" style={{ fontFamily: "var(--font-typewriter), monospace" }}>
          sign out
        </button>
      </form>

      <div className="relative z-[3] flex flex-col px-[26px]" style={{ paddingTop: 92, paddingBottom: 30 }}>
        <div className="eyebrow">step 2 of 4 · invite</div>

        <h1
          className="mt-[18px] text-white"
          style={{
            fontFamily: "var(--font-display), 'Fraunces', serif",
            fontWeight: 300,
            fontSize: 36,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
          }}
        >
          Ask {Math.max(0, 3 - submissionCount) || "3"} {Math.max(0, 3 - submissionCount) === 1 ? "more person" : "people"}
          <br />
          <em style={{ fontFamily: "var(--font-italic), 'Instrument Serif', serif", fontWeight: 400, fontStyle: "italic" }}>
            who get you
          </em>
          .
        </h1>

        <p
          className="mt-[14px] text-white/60"
          style={{ fontSize: 14, lineHeight: 1.5, maxWidth: 300 }}
        >
          They&apos;ll get a link. Three quick questions. Sixty seconds, max.{" "}
          <em style={{ fontFamily: "var(--font-italic), 'Instrument Serif', serif" }}>
            You&apos;ll be the only one who sees their answers.
          </em>
        </p>

        {/* Progress dots */}
        <div className="mt-[22px] flex items-center gap-3">
          <ProgressDots done={submissionCount} total={3} />
          <div className="text-[13px] text-white/80">
            <span className="text-white font-medium">{submissionCount} of 3</span> vouches in
          </div>
        </div>

        {/* Friend list */}
        <div className="mt-[22px] flex flex-col gap-0.5">
          {rows.slice(0, 5).map((r, i) => (
            <FriendRow key={i} {...r} />
          ))}
          <AddRow />
        </div>

        {/* Synthesize / discover step (replaces "step 3-of-3" card from old dashboard) */}
        {(ready || live) && (
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href={live ? "/discover" : "/review"}
              className="cta-pill"
              style={{ background: live ? "#fff" : "#fff" }}
            >
              {live
                ? "Open discover →"
                : latestDraft
                ? "Review your draft →"
                : "Generate your bio →"}
            </Link>
            <div className="text-center eyebrow opacity-70">
              {live ? "you're live" : latestDraft ? "draft ready" : "ready when you are"}
            </div>
          </div>
        )}

        <div className="flex-1 min-h-[20px]" />

        {/* Invite link preview + send-via-iMessage CTA (the existing component) */}
        <ShareInvite slug={profile.invite_slug} displayName={profile.display_name} />
      </div>
    </main>
  );
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function ProgressDots({ done, total }: { done: number; total: number }) {
  return (
    <div className="flex gap-[5px]">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-colors duration-300"
          style={{
            width: 24,
            height: 6,
            background: i < done ? "#e8a575" : "rgba(255,255,255,0.14)",
            boxShadow: i < done ? "0 0 12px rgba(232,165,117,0.5)" : "none",
          }}
        />
      ))}
    </div>
  );
}

function FriendRow({
  name,
  relation,
  status,
  initials,
}: {
  name: string;
  relation: string;
  status: "vouched" | "pending" | "invite";
  initials: string;
}) {
  return (
    <div
      className="flex items-center gap-3 py-3"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div
        className="flex-shrink-0 w-[38px] h-[38px] rounded-full flex items-center justify-center text-white"
        style={{
          background:
            status === "vouched"
              ? "linear-gradient(135deg, #d28865 0%, #8a3e2a 100%)"
              : status === "pending"
              ? "linear-gradient(135deg, #e8a575 0%, #a06040 100%)"
              : "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.1)",
          fontFamily: "var(--font-display), 'Fraunces', serif",
          fontSize: 14,
        }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] text-white" style={{ letterSpacing: "-0.005em" }}>
          {name}
        </div>
        <div
          className="mt-px text-white/40"
          style={{
            fontFamily: "var(--font-typewriter), monospace",
            fontSize: 10,
            letterSpacing: "0.12em",
          }}
        >
          {relation}
        </div>
      </div>
      <span
        className={
          "status-pill " +
          (status === "vouched" ? "status-vouched" : status === "pending" ? "status-pending" : "status-invite")
        }
      >
        {status === "vouched" ? "✓ vouched" : status === "pending" ? "waiting" : "send"}
      </span>
    </div>
  );
}

function AddRow() {
  return (
    <button className="flex items-center gap-3 py-3 bg-transparent border-0 cursor-pointer text-left w-full">
      <div
        className="flex-shrink-0 w-[38px] h-[38px] rounded-full flex items-center justify-center text-white/50 text-lg"
        style={{ border: "1px dashed rgba(255,255,255,0.25)" }}
      >
        +
      </div>
      <div className="text-[14px] text-white/55">add another friend</div>
    </button>
  );
}
