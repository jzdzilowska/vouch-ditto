"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

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
      <ProfileBackdrop />

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

      <ProfilePhotoHero profile={profile} vouchCount={vouches.length} vouches={vouches} />

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
              <ThreeWordsSection vouches={vouches} />
              <PerfectDateSection vouches={vouches} />
              <ChosenBySection vouches={vouches} />
            </>
          )}

          <PhotoStripSection profile={profile} />
          <Wordmark />
        </div>
      </div>
    </main>
  );
}

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
      <div className="profile-backdrop-glow" />
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
      <div className="orb-wash" style={{ background: "rgba(8, 4, 12, 0.55)" }} />
      <div className="profile-backdrop-topgrad" />
      <div className="hero-grain profile-backdrop-grain" />
    </div>
  );
}

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
  const [visiblePhotoIdx, setVisiblePhotoIdx] = useState(0);
  const [incomingPhotoIdx, setIncomingPhotoIdx] = useState<number | null>(null);
  const swapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const photos = profile.photo_urls;
  const totalPhotos = Math.max(1, photos.length);
  const photo = photos[visiblePhotoIdx] ?? null;
  const incomingPhoto =
    incomingPhotoIdx != null ? photos[incomingPhotoIdx] ?? null : null;
  const spotlightVouch =
    vouches.length > 0 ? vouches[photoIdx % vouches.length] : null;
  const CROSSFADE_MS = 360;

  useEffect(() => {
    return () => {
      if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
    };
  }, []);

  function goTo(target: number) {
    if (target === visiblePhotoIdx || totalPhotos <= 1) return;
    setPhotoIdx(target);
    setIncomingPhotoIdx(target);
    if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
    swapTimerRef.current = setTimeout(() => {
      setVisiblePhotoIdx(target);
      setIncomingPhotoIdx(null);
      swapTimerRef.current = null;
    }, CROSSFADE_MS);
  }

  function next() {
    goTo((photoIdx + 1) % totalPhotos);
  }
  function prev() {
    goTo((photoIdx - 1 + totalPhotos) % totalPhotos);
  }

  // Profile number — just a stable display device. Use last 3 chars of
  // the uuid (in caps) so different profiles read differently.
  const profileNo = profile.id.replace(/[^a-z0-9]/gi, "").slice(-3).toUpperCase();

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{ height: "100dvh", maxHeight: 874, zIndex: 2}}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`base-${visiblePhotoIdx}`}
          src={photo}
          alt={profile.display_name}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
          style={{ opacity: 1 }}
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-900" />
      )}
      {incomingPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`incoming-${incomingPhotoIdx}`}
          src={incomingPhoto}
          alt={profile.display_name}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
          style={{ animation: `fadeUp ${CROSSFADE_MS}ms ease-out both` }}
        />
      ) : null}

      <div
        className="absolute left-0 right-0 top-0 pointer-events-none"
        style={{
          height: 180,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 60%, transparent 100%)",
          zIndex: 2,
        }}
      />

      <div
        className="absolute left-0 right-0 bottom-0 pointer-events-none"
        style={{
          height: 360,
          background:
            "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.45) 38%, rgba(0,0,0,0.92) 88%)",
          zIndex: 2,
        }}
      />

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


      <div
        className="absolute"
        style={{ left: 22, right: 22, bottom: 44, zIndex: 5 }}
      >
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
          justifyContent: "center",
          marginTop: "40px",
          textAlign: "center",
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
                  fontFamily: SANS,
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

function PerfectDateSection({ vouches }: { vouches: ProfileViewVouch[] }) {
  const [idx, setIdx] = useState(0);
  const v = vouches[idx];
  if (!v) return null;
  const hasMany = vouches.length > 1;
  const prev = () => setIdx((i) => (i - 1 + vouches.length) % vouches.length);
  const next = () => setIdx((i) => (i + 1) % vouches.length);
  return (
    <SectionShell
      label="a perfect first date" 
      style={{ alignItems: "center", justifyContent: "center", textAlign: "center"}}
    >
      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
        <button
          type="button"
          onClick={prev}
          aria-label="Previous perfect date quote"
          disabled={!hasMany}
          style={{
            border: "none",
            background: "transparent",
            color: "rgba(255,255,255,0.8)",
            fontFamily: SANS,
            fontSize: 20,
            lineHeight: 1,
            cursor: hasMany ? "pointer" : "default",
            opacity: hasMany ? 0.9 : 0.25,
            padding: 0,
            width: 16,
            flexShrink: 0,
          }}
        >
          ‹
        </button>
        <div
          key={v.name + idx}
          style={{
            fontFamily: ITALIC,
            fontStyle: "italic",
            fontSize: 22,
            lineHeight: 1.32,
            letterSpacing: "-0.01em",
            color: "rgba(255,255,255,0.94)",
            animation: "fadeUp 0.45s ease-out",
            flex: 1,
          }}
        >
          {v.q2}
        </div>
        <button
          type="button"
          onClick={next}
          aria-label="Next perfect date quote"
          disabled={!hasMany}
          style={{
            border: "none",
            background: "transparent",
            color: "rgba(255,255,255,0.8)",
            fontFamily: SANS,
            fontSize: 20,
            lineHeight: 1,
            cursor: hasMany ? "pointer" : "default",
            opacity: hasMany ? 0.9 : 0.25,
            padding: 0,
            width: 16,
            flexShrink: 0,
          }}
        >
          ›
        </button>
      </div>

      <div style={{ marginTop: 6, paddingLeft: 14 }}>
        <span
          style={{
            fontFamily: SANS,
            fontSize: 11,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "-0.005em",
          }}
        >
          / {v.name}
          {v.relation ? `, ${v.relation}` : ""}
        </span>
      </div>
    </SectionShell>
  );
}

function SecretStrengthSection({ vouches }: { vouches: ProfileViewVouch[] }) {
  return (
    <SectionShell
      label="what a date wouldn't notice but should"
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
                fontFamily: SANS,
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
              <VouchedBy name={v.name} pulse />
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function ChosenBySection({ vouches }: { vouches: ProfileViewVouch[] }) {
  return (
    <SectionShell
      label="chosen by"
    >
      <div style={{ display: "flex", flexDirection: "column", marginTop: "-20px" }}>
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

function PhotoStripSection({ profile }: { profile: ProfileViewProfile }) {
  if (profile.photo_urls.length === 0) return null;
  return (
    <SectionShell
      label=""
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
      style={{ padding: "18px 26px 18px", position: "relative", ...style }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 10,
          marginBottom: 14,
          flexWrap: "wrap",
          textAlign: "center",
          justifyContent: "center",
        }}
      >
        {label ? <Eyebrow>{label}</Eyebrow> : null}
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
        fontFamily: SANS,
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

function VouchedBy({ name, pulse = false }: { name: string; pulse?: boolean }) {
  return (
    <span
      style={{
        fontFamily: SANS,
        fontSize: 12,
        color: "rgba(255,255,255,0.55)",
        letterSpacing: "-0.005em",
        animation: pulse ? "profileVouchPulse 2.2s ease-in-out infinite" : undefined,
        display: "inline-block",
      }}
    >
      / {name}
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
        style={{ fontSize: 22, color: "rgba(255, 255, 255, 0.87)" }}
      >
        vouch<sup>®</sup>
      </div>
    </div>
  );
}
