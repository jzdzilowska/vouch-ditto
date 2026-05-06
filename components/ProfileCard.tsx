"use client";

import { useState } from "react";

export type VouchExcerpt = {
  text: string;
  author: string;
  relation: string | null;
};

export type ProfileCardData = {
  id: string;
  display_name: string;
  age: number | null;
  city: string | null;
  bio: string | null; // approved AI bio (used as a default first vouch text)
  photo_urls: string[];
  vouches?: VouchExcerpt[];
  vouchedBy?: string[]; // first names list (kept for compatibility)
  occupation?: string | null;
};

export default function ProfileCard({ profile }: { profile: ProfileCardData }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [vouchIdx, setVouchIdx] = useState(0);

  const photos = profile.photo_urls.length ? profile.photo_urls : [];
  const totalPhotos = Math.max(1, photos.length);
  const photo = photos[photoIdx] ?? null;

  const vouches: VouchExcerpt[] =
    profile.vouches && profile.vouches.length > 0
      ? profile.vouches
      : profile.bio
      ? [{ text: profile.bio, author: "vouch", relation: null }]
      : [];
  const vouch = vouches[vouchIdx] ?? null;

  function tapLeft() {
    setPhotoIdx((i) => Math.max(0, i - 1));
  }
  function tapRight() {
    setPhotoIdx((i) => Math.min(totalPhotos - 1, i + 1));
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none" style={{ minHeight: 600 }}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={profile.display_name}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 hero-photo">
          <div className="hero-art hero-warm" />
          <div className="hero-grain" />
        </div>
      )}

      <div
        className="absolute flex gap-1 z-10 pointer-events-none"
        style={{ top: 18, left: 14, right: 14 }}
      >
        {Array.from({ length: totalPhotos }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-[2px] rounded-full bg-white/25 overflow-hidden"
          >
            <div
              className="h-full bg-white transition-[width] duration-400 ease-out"
              style={{ width: i <= photoIdx ? "100%" : "0%" }}
            />
          </div>
        ))}
      </div>

      {totalPhotos > 1 && (
        <>
          <button
            aria-label="Previous photo"
            onClick={tapLeft}
            className="absolute z-20"
            style={{ top: 40, left: 0, width: "40%", bottom: 380 }}
          />
          <button
            aria-label="Next photo"
            onClick={tapRight}
            className="absolute z-20"
            style={{ top: 40, right: 0, width: "40%", bottom: 380 }}
          />
        </>
      )}

      <div
        className="absolute left-0 right-0 bottom-0 pointer-events-none z-[2]"
        style={{
          height: 540,
          background:
            "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.45) 30%, rgba(0,0,0,0.92) 70%)",
        }}
      />

      <div
        className="absolute z-30 flex flex-col gap-4"
        style={{ left: 22, right: 22, bottom: 28 }}
      >
        <div>
          <div
            className="text-white"
            style={{
              fontFamily: "var(--font-display), 'Fraunces', serif",
              fontWeight: 300,
              fontSize: 42,
              letterSpacing: "-0.03em",
              lineHeight: 0.95,
            }}
          >
            {profile.display_name}
            {profile.age != null && (
              <span style={{ fontWeight: 200, opacity: 0.8, marginLeft: 8 }}>
                {profile.age}
              </span>
            )}
          </div>
          <div
            className="mt-1.5 text-white/60"
            style={{
              fontFamily: "var(--font-typewriter), monospace",
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            {[
              profile.city,
              profile.occupation,
              `${profile.vouches?.length ?? 0} ${
                (profile.vouches?.length ?? 0) === 1 ? "vouch" : "vouches"
              }`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </div>

        <div className="h-px bg-white/10" />

        {vouch && (
          <div>
            <div
              className="inline-flex items-center gap-2 px-[11px] py-[5px] rounded-full mb-3 backdrop-blur-md"
              style={{
                border: "1px solid rgba(255,255,255,0.45)",
                background: "rgba(255,255,255,0.04)",
                fontFamily: "var(--font-typewriter), monospace",
                fontSize: 9.5,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#fff",
              }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-white" />
              vouched by {vouch.author}
            </div>

            <div
              className="text-white"
              style={{
                fontFamily: "var(--font-italic), 'Instrument Serif', serif",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 18,
                lineHeight: 1.3,
                letterSpacing: "-0.005em",
              }}
            >
              {vouch.text}
            </div>

            {vouch.relation && (
              <div
                className="mt-2 text-white/50"
                style={{
                  fontFamily: "var(--font-typewriter), monospace",
                  fontSize: 9,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                — {vouch.author}, {vouch.relation}
              </div>
            )}

            {vouches.length > 1 && (
              <div className="flex gap-1.5 mt-3.5">
                {vouches.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setVouchIdx(i)}
                    className="rounded-full transition-all duration-300 border-0 p-0 cursor-pointer"
                    style={{
                      width: i === vouchIdx ? 22 : 6,
                      height: 6,
                      background:
                        i === vouchIdx ? "#fff" : "rgba(255,255,255,0.32)",
                    }}
                    aria-label={`Vouch ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
