"use client";

import { useState } from "react";
import Link from "next/link";

// Profile redesign — "your profile is made out of other people's words"
//
// Layout = Variant A "Pages" from the design spec:
//   1) Full-bleed photo hero (fills the visible area). Masthead-style
//      bottom stack: PROFILE NO. xxx eyebrow + 76px Fraunces name +
//      hairline + 2-col metadata, with a circular vouch-count seal in
//      the upper right and a "keep scrolling" cue at the very bottom.
//   2) Below the hero, the orb-molecule animated backdrop (same moving
//      gradient as /onboarding) with the vouch-built sections:
//      hero quote → three-words constellation → perfect-date carousel
//      → secret-strength stack → chosen-by friend rows → photo strip.
//
// The orb backdrop is `position: fixed` so it stays anchored to the
// viewport as the user scrolls — exactly like the onboarding page,
// where the orbs drift behind the content. The photo hero overlays it
// (full opaque image), then below the hero the canvas is transparent
// so the orbs read through.

export type ProfileViewVouch = {
  name: string;
  relation: string | null;
  q1: string; // three words
  q2: string; // perfect first date
  q3: string; // secret strength
};

export type ProfileViewProfile = {
  id: string;
  display_name: string;
  age: number | null;
  city: string | null;
  bio: string | null;
  photo_urls: string[];
};

const SANS = "var(--font-sans), Inter, system-ui, sans-serif";
const DISPLAY = "var(--font-display), 'Fraunces', serif";
const ITALIC = "var(--font-italic), 'Instrument Serif', serif";
const MONO = "var(--font-typewriter), 'Special Elite', monospace";

export default function ProfileView({
  profile,
  vouches,
}: {
  profile: ProfileViewProfile;
  vouches: ProfileViewVouch[];
}) {
  return (
    <main className="phone-edge-to-edge relative w-full bg-black text-ink">
      {/* Fixed orb backdrop — the moving gradient from onboarding,
          anchored to the viewport so it stays in place as the page
          scrolls. Photo hero overlays it (full opaque image); below
          the hero the canvas is transparent so the orbs read through. */}
      <ProfileBackdrop />

      {/* Top chrome — back chevron, in the dashboard's voice */}
      <div
        className="absolute z-40"
        style={{ top: 44, left: 22 }}
      >
        <Link
          href="/dashboard"
          aria-label="Back to dashboard"
          className="dash-signout"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            textDecoration: "none",
          }}
        >
          <span aria-hidden style={{ fontSize: 14, lineHeight: 1 }}>
            ‹
          </span>
          back
        </Link>
      </div>

      {/* Photo hero — first visible screen */}
      <ProfilePhotoHero profile={profile} vouchCount={vouches.length} vouches={vouches} />

      {/* Below-the-fold canvas — orb shows through. Soft seam from the
          black photo bottom into the orb canvas. */}
      <div className="relative" style={{ zIndex: 2 }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: -1,
            height: 80,
            background:
              "linear-gradient(180deg, #000 0%, rgba(0,0,0,0.65) 50%, transparent 100%)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        <div className="relative" style={{ zIndex: 2, paddingTop: 10 }}>

          {vouches.length > 0 && (
            <>
              <Hairline style={{ margin: "32px 24px 0" }} />
              <ThreeWordsSection vouches={vouches} />
              <Hairline style={{ margin: "0 24px" }} />
              <PerfectDateSection vouches={vouches} />
              <Hairline style={{ margin: "0 24px" }} />
              <SecretStrengthSection vouches={vouches} />
              <Hairline style={{ margin: "0 24px" }} />
              <ChosenBySection vouches={vouches} />
              <Hairline style={{ margin: "0 24px" }} />
            </>
          )}

          <PhotoStripSection profile={profile} />
          <Wordmark />
        </div>
      </div>
    </main>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Backdrop — orb molecule + grain, fixed-positioned so it follows the
// viewport as the page scrolls (same drifting gradient as onboarding).
// ──────────────────────────────────────────────────────────────────────
function ProfileBackdrop() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        isolation: "isolate",
        pointerEvents: "none",
      }}
    >
      <div className="hero-base" />
      <div className="molecule">
        <div className="orb orb-amber-t2" />
        <div className="orb orb-amber-t1" />
        <div className="orb orb-amber" />
        <div className="orb orb-red-t2" />
        <div className="orb orb-red-t1" />
        <div className="orb orb-red" />
        <div className="orb orb-pink-t2" />
        <div className="orb orb-pink-t1" />
        <div className="orb orb-pink" />
      </div>
      {/* Heavier wash so type stays legible */}
      <div className="orb-wash" style={{ background: "rgba(8, 4, 12, 0.55)" }} />
      <div className="hero-grain" />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Photo hero — fills the first visible screen. Masthead-style bottom
// stack with a circular vouch-count seal in the upper right.
// ──────────────────────────────────────────────────────────────────────
function ProfilePhotoHero({
  profile,
  vouchCount,
  vouches,
}: {
  profile: ProfileViewProfile;
  vouchCount: number;
  vouches: ProfileViewVouch[];
}) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = profile.photo_urls;
  const totalPhotos = Math.max(1, photos.length);
  const photo = photos[photoIdx] ?? null;
  const spotlightVouch = vouches.length > 0 ? vouches[0] : null;

  function next() {
    setPhotoIdx((i) => (i + 1) % totalPhotos);
  }
  function prev() {
    setPhotoIdx((i) => (i - 1 + totalPhotos) % totalPhotos);
  }

  // Profile number — just a stable display device. Use last 3 chars of
  // the uuid (in caps) so different profiles read differently.
  const profileNo = profile.id.replace(/[^a-z0-9]/gi, "").slice(-3).toUpperCase();

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{ height: "100dvh", maxHeight: 874, zIndex: 2 }}
    >
      {/* Photo — full-bleed, untouched. Cross-fade on swap via key. */}
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={photoIdx}
          src={photo}
          alt={profile.display_name}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
          style={{ animation: "fadeUp 0.4s ease-out" }}
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-900" />
      )}

      {/* Top fade — segments + chrome legibility */}
      <div
        className="absolute left-0 right-0 top-0 pointer-events-none"
        style={{
          height: 180,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 60%, transparent 100%)",
          zIndex: 2,
        }}
      />

      {/* Bottom fade — text legibility, taller */}
      <div
        className="absolute left-0 right-0 bottom-0 pointer-events-none"
        style={{
          height: 360,
          background:
            "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.45) 38%, rgba(0,0,0,0.92) 88%)",
          zIndex: 2,
        }}
      />

      {/* Tap zones — left/right halves cycle photos */}
      {totalPhotos > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={prev}
            className="absolute"
            style={{
              top: 96,
              bottom: 220,
              left: 0,
              width: "40%",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              zIndex: 4,
            }}
          />
          <button
            type="button"
            aria-label="Next photo"
            onClick={next}
            className="absolute"
            style={{
              top: 96,
              bottom: 220,
              right: 0,
              width: "40%",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              zIndex: 4,
            }}
          />
        </>
      )}


      {/* Bottom stack — masthead */}
      <div
        className="absolute"
        style={{ left: 22, right: 22, bottom: 92, zIndex: 5 }}
      >
        {/* Name — masthead Fraunces 76px */}
        <h1
          style={{
            fontFamily: DISPLAY,
            fontWeight: 300,
            fontSize: 64,
            letterSpacing: "-0.04em",
            lineHeight: 0.88,
            color: "#fff",
            margin: 0,
            // @ts-ignore — text-wrap balance works in modern browsers
            textWrap: "balance",
          }}
        >
          {profile.display_name}
        </h1>

        {/* metadata — only "based in" since occupation isn't in the
            profiles schema. Keeps the typographic specimen feel. */}
        {profile.city && (
          <div>
            <div
              style={{
                fontFamily: SANS,
                fontSize: 12,
                lineHeight: 1.5,
                color: "#fff",
                letterSpacing: "-0.01em",
                opacity: 0.8,
                marginLeft: 14,
                marginBottom: 20,
              }}
            >
              {profile.age}, {profile.city}
            </div>
          </div>
        )}

        {spotlightVouch && (
          <div style={{ marginTop: 10 }}>
            <div
              style={{
                fontFamily: ITALIC,
                fontStyle: "italic",
                fontSize: 19,
                lineHeight: 1.25,
                letterSpacing: "-0.01em",
                color: "rgba(255,255,255,0.98)",
                textShadow: "0 2px 18px rgba(0,0,0,0.55)",
                maxWidth: "auto",
              }}
            >
              {spotlightVouch.q3}
            </div>
            <div style={{ marginTop: 4 }}>
              <VouchedBy name={spotlightVouch.name} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Three-words constellation — every friend's q1 split into words, with
// sup tags showing which friend(s) said it. Words said by 2+ friends
// emphasized larger.
// ──────────────────────────────────────────────────────────────────────
function ThreeWordsSection({ vouches }: { vouches: ProfileViewVouch[] }) {
  type WordEntry = { word: string; by: string[] };
  const wordMap: Record<string, WordEntry> = {};
  vouches.forEach((v) => {
    v.q1
      .split(/[\s,]+/)
      .filter(Boolean)
      .forEach((w) => {
        const key = w.toLowerCase().replace(/[^a-z]/g, "");
        if (!key) return;
        if (!wordMap[key]) wordMap[key] = { word: w, by: [] };
        wordMap[key].by.push(v.name[0]?.toUpperCase() ?? "?");
      });
  });
  const words = Object.values(wordMap);
  if (words.length === 0) return null;

  return (
    <SectionShell label="">
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "14px 14px",
          padding: "0px 0 0px",
          alignItems: "baseline",
          justifyContent: "flex-start",
        }}
      >
        {words.map((w, i) => {
          const italic = i % 3 === 1;
          const big = w.by.length > 1;
          return (
            <span
              key={w.word + i}
              style={{
                fontFamily: italic ? ITALIC : DISPLAY,
                fontStyle: italic ? "italic" : "normal",
                fontWeight: italic ? 400 : 300,
                fontSize: big ? 30 : 22,
                color: big ? "#fff" : "rgba(255,255,255,0.78)",
                letterSpacing: "-0.02em",
                lineHeight: 1,
                position: "relative",
              }}
            >
              {w.word.toLowerCase()}
              <sup
                style={{
                  fontFamily: MONO,
                  fontSize: 8,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)",
                  marginLeft: 2,
                  fontWeight: 400,
                  fontStyle: "normal",
                }}
              >
                {w.by.join("·")}
              </sup>
            </span>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Perfect-date carousel — avatar selector at top, then italic 22px
// quote with a left border. Tap an avatar to switch friend.
// ──────────────────────────────────────────────────────────────────────
function PerfectDateSection({ vouches }: { vouches: ProfileViewVouch[] }) {
  const [idx, setIdx] = useState(0);
  const v = vouches[idx];
  if (!v) return null;
  return (
    <SectionShell
      label="a perfect first date"
      caption="according to the people who'd know"
    >
      {/* avatar selector */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        {vouches.map((vv, i) => {
          const active = i === idx;
          return (
            <button
              key={vv.name + i}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`See ${vv.name}'s perfect date`}
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                opacity: active ? 1 : 0.45,
                transition: "opacity 0.3s ease",
              }}
            >
              <span
                className="dash-friend__avatar"
                style={{
                  borderColor: active
                    ? "rgba(255,255,255,0.6)"
                    : "rgba(255,255,255,0.14)",
                }}
              >
                {vv.name[0]}
              </span>
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 12,
                  color: active ? "#fff" : "rgba(255,255,255,0.5)",
                  letterSpacing: "-0.005em",
                }}
              >
                {vv.name.toLowerCase()}
              </span>
            </button>
          );
        })}
      </div>

      <div
        key={v.name + idx}
        style={{
          fontFamily: ITALIC,
          fontStyle: "italic",
          fontSize: 22,
          lineHeight: 1.32,
          letterSpacing: "-0.01em",
          color: "rgba(255,255,255,0.94)",
          paddingLeft: 14,
          borderLeft: "1px solid rgba(255,255,255,0.18)",
          animation: "fadeUp 0.45s ease-out",
        }}
      >
        {v.q2}
      </div>

      <div style={{ marginTop: 12, paddingLeft: 14 }}>
        <span
          style={{
            fontFamily: SANS,
            fontSize: 11,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "-0.005em",
          }}
        >
          — {v.name}
          {v.relation ? `, ${v.relation}` : ""}
        </span>
      </div>
    </SectionShell>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Secret-strength stack — every q3 with a footnote-style number marker.
// ──────────────────────────────────────────────────────────────────────
function SecretStrengthSection({ vouches }: { vouches: ProfileViewVouch[] }) {
  return (
    <SectionShell
      label="what a date wouldn't notice"
      caption="but should"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        {vouches.map((v, i) => (
          <div
            key={v.name + i}
            style={{ position: "relative", paddingLeft: 22 }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 4,
                fontFamily: MONO,
                fontSize: 9,
                letterSpacing: "0.22em",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              0{i + 1}
            </div>
            <div
              style={{
                fontFamily: SANS,
                fontSize: 14,
                lineHeight: 1.55,
                color: "rgba(255,255,255,0.92)",
                letterSpacing: "-0.005em",
              }}
            >
              {v.q3}
            </div>
            <div style={{ marginTop: 6 }}>
              <VouchedBy name={v.name} />
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Chosen-by — small portrait row of friends who vouched. Reads like
// the credits at the end. Reuses the dashboard's .dash-friend rows.
// ──────────────────────────────────────────────────────────────────────
function ChosenBySection({ vouches }: { vouches: ProfileViewVouch[] }) {
  return (
    <SectionShell
      label="chosen by"
      caption={`the ${vouches.length} who know you best`}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {vouches.map((v, i) => (
          <div
            key={v.name + i}
            className="dash-friend"
            style={{ paddingLeft: 0, paddingRight: 0, cursor: "default" }}
          >
            <div className="dash-friend__avatar">{v.name[0]}</div>
            <div className="dash-friend__body">
              <div className="dash-friend__name">{v.name}</div>
              <div className="dash-friend__relation">
                {v.relation || "friend"}
              </div>
            </div>
            <span className="dash-friend__status">
              <em>vouched.</em>
            </span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Photo strip — the rest of the photos, secondary to the words.
// Horizontal scroll, smallish.
// ──────────────────────────────────────────────────────────────────────
function PhotoStripSection({ profile }: { profile: ProfileViewProfile }) {
  if (profile.photo_urls.length === 0) return null;
  return (
    <SectionShell
      label="and what you look like"
      caption="the rest of the photos"
    >
      <div
        className="no-scrollbar"
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {profile.photo_urls.map((url, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={url}
            alt=""
            draggable={false}
            style={{
              width: 108,
              height: 144,
              objectFit: "cover",
              borderRadius: 12,
              flexShrink: 0,
              boxShadow:
                "0 12px 40px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          />
        ))}
      </div>
    </SectionShell>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Section shell — eyebrow + italic caption + content. Reused.
// ──────────────────────────────────────────────────────────────────────
function SectionShell({
  label,
  caption,
  children,
  style,
}: {
  label: string;
  caption?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <section
      style={{ padding: "26px 24px 26px", position: "relative", ...style }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 10,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <Eyebrow>{label}</Eyebrow>
        {caption && (
          <span
            style={{
              fontFamily: ITALIC,
              fontStyle: "italic",
              fontSize: 14,
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "-0.005em",
            }}
          >
            — {caption}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function Eyebrow({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 9.5,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.5)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Hairline({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      style={{ height: 1, background: "rgba(255,255,255,0.08)", ...style }}
    />
  );
}

function VouchedBy({ name }: { name: string }) {
  return (
    <span
      style={{
        fontFamily: SANS,
        fontSize: 12,
        color: "rgba(255,255,255,0.55)",
        letterSpacing: "-0.005em",
      }}
    >
      / vouched by {name}.
    </span>
  );
}

function Wordmark() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "32px 0 60px",
      }}
    >
      <div
        className="wordmark"
        style={{ fontSize: 22, color: "rgba(255,255,255,0.45)" }}
      >
        vouch<sup>®</sup>
      </div>
    </div>
  );
}
