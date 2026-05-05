import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import HeroBackdrop from "@/components/HeroBackdrop";
import GrainOverlay from "@/components/GrainOverlay";
import HeartIcon from "@/components/HeartIcon";
import ShareInvite from "./ShareInvite";

export const dynamic = "force-dynamic";

// Dashboard — same dressing as the landing page: black canvas, drifting
// orb molecule, film grain on top, 14px sans body with italic em accents,
// CTA pills that cross-fade to a heart on hover. Functionally still the
// 3-vouch invite hub: gates synthesis at 2+ vouches, shows live/draft
// status, posts to the same Supabase tables.
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

  if (!profile) redirect("/");

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
  const remaining = Math.max(0, 3 - submissionCount);

  type FriendRow = { name: string; relation: string; status: "vouched" | "pending" | "invite"; initials: string };
  const rows: FriendRow[] = (submissions ?? []).map((s) => ({
    name: s.friend_name,
    relation: s.friend_relationship || "friend",
    status: "vouched",
    initials: initialsOf(s.friend_name),
  }));
  while (rows.length < 3) {
    rows.push({ name: "waiting", relation: "send your link", status: "invite", initials: "+" });
  }

  return (
    <main className="phone-edge-to-edge relative w-full h-full min-h-[100dvh] overflow-hidden bg-black text-ink">
      <HeroBackdrop />
      <GrainOverlay opacity={0.2} />

      <form
        action="/auth/signout"
        method="post"
        className="absolute z-10"
        style={{ top: 44, right: 22 }}
      >
        <button className="dash-signout">sign out</button>
      </form>

      <div className={"dash-shell" + (remaining === 0 ? " dash-shell--complete" : "")}>
        <h1
          className="welcome-heading"
          style={remaining === 0 ? { maxWidth: 280, marginBottom: -10 } : { maxWidth: 280 }}
        >
          {remaining === 0 ? (
            <>
              All three are <em>in.</em>
            </>
          ) : remaining === 1 ? (
            <>
              One more voice <em>and you’re seen.</em>
            </>
          ) : (
            <>
              Now honor <em>the chosen three</em> who know you best.
            </>
          )}
        </h1>

        <div className="dash-progress">
          <div className="dash-progress-row">
            {[0, 1, 2].map((i) => (
              <span key={i} className="dash-progress-pill" data-done={i < submissionCount} />
            ))}
          </div>
          <div className="dash-progress-caption">
            {submissionCount} of 3{" "}
            {submissionCount === 0 ? "to begin" : submissionCount >= 3 ? "in" : "so far"}
          </div>
        </div>

        <div className="dash-friends">
          {rows.slice(0, 5).map((r, i) => (
            <FriendRow key={i} {...r} />
          ))}
        </div>

        {(ready || live) && (
          <Link
            href={live ? "/discover" : "/review"}
            className="cta-pill"
            aria-label={live ? "Open discover" : latestDraft ? "Review your draft" : "You have some great friends. Your bio's ready."}
            style={
              !live && !latestDraft
                ? { minWidth: 290, marginTop: 14, marginBottom: -10 }
                : undefined
            }
          >
            <span className="cta-pill__label">
              {live ? (
                "Open discover"
              ) : latestDraft ? (
                "Review your draft"
              ) : (
                <span
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    lineHeight: 1.15,
                    gap: 2,
                  }}
                >
                  <span>Your bio&apos;s ready.</span>
                  You have some great friends.
                </span>
              )}
            </span>
            <span className="cta-pill__heart" aria-hidden>
              <HeartIcon />
            </span>
          </Link>
        )}

        {remaining > 0 && (
          <ShareInvite slug={profile.invite_slug} displayName={profile.display_name} />
        )}
      </div>

      <div className="absolute" style={{ right: 22, bottom: 28 }}>
        <div className="wordmark" style={{ fontSize: 28 }}>
          vouch<sup>®</sup>
        </div>
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
  const isInvite = status === "invite";
  return (
    <div className="dash-friend">
      <div
        className={"dash-friend__avatar" + (isInvite ? " dash-friend__avatar--invite" : "")}
      >
        {initials}
      </div>
      <div className="dash-friend__body">
        <div
          className={"dash-friend__name" + (isInvite ? " dash-friend__name--placeholder" : "")}
        >
          {name}
        </div>
        <div className="dash-friend__relation">{relation}</div>
      </div>
      <span className="dash-friend__status">
        {status === "vouched" ? (
          <em>vouched.</em>
        ) : status === "pending" ? (
          "waiting"
        ) : (
          <em>send.</em>
        )}
      </span>
    </div>
  );
}
