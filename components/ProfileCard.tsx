"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ProfileCardData = {
  id: string;
  display_name: string;
  age: number | null;
  city: string | null;
  bio: string | null;
  photo_urls: string[];
  vouchedBy?: string[]; // first names of friends who submitted
};

// A single profile card shown in the discover feed (or as a self-preview).
// Internal horizontal swiper through the photos; bio + name overlaid on top.
// The card itself is positionless — wrap it in a deck for stack/swipe-to-decide.
export default function ProfileCard({ profile, expanded = false }: { profile: ProfileCardData; expanded?: boolean }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [showFullBio, setShowFullBio] = useState(expanded);

  const photos = profile.photo_urls.length ? profile.photo_urls : [];
  const total = photos.length;
  const photo = photos[photoIdx] ?? null;

  function next() { if (total) setPhotoIdx((i) => (i + 1) % total); }
  function prev() { if (total) setPhotoIdx((i) => (i - 1 + total) % total); }

  function onDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
    const swipe = Math.abs(info.offset.x) * info.velocity.x;
    if (info.offset.x < -60 || swipe < -10000) next();
    else if (info.offset.x > 60 || swipe > 10000) prev();
  }

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-3xl overflow-hidden bg-card border border-white/5 shadow-2xl select-none">
      {/* Photo (animated on idx change) */}
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={photoIdx}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={onDragEnd}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt={profile.display_name}
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-muted">no photo</div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Tap zones for prev/next photo (don't block drag — they sit above the photo only) */}
      {total > 1 && (
        <>
          <button
            aria-label="Previous photo"
            onClick={prev}
            className="absolute inset-y-0 left-0 w-1/2 z-10"
          />
          <button
            aria-label="Next photo"
            onClick={next}
            className="absolute inset-y-0 right-0 w-1/2 z-10"
          />
        </>
      )}

      {/* Photo segment indicator (Instagram Stories style) */}
      {total > 1 && (
        <div className="absolute top-3 left-3 right-3 z-20 flex gap-1 pointer-events-none">
          {photos.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className={`h-full bg-white transition-all duration-200 ${i < photoIdx ? "w-full" : i === photoIdx ? "w-full" : "w-0"}`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Bottom gradient + bio overlay */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/55 to-transparent pt-24 px-5 pb-5 pointer-events-none">
        <div className="pointer-events-auto">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-display tracking-tight">{profile.display_name}</span>
            {profile.age != null && (
              <span className="text-2xl text-ink/80 font-light">{profile.age}</span>
            )}
          </div>
          {profile.city && (
            <div className="text-xs text-ink/70 mb-2">{profile.city}</div>
          )}

          <p
            className={`text-[15px] leading-snug text-ink/95 cursor-pointer ${
              showFullBio ? "" : "line-clamp-3"
            }`}
            onClick={() => setShowFullBio((v) => !v)}
          >
            {profile.bio || <span className="text-muted italic">No bio yet.</span>}
          </p>

          {profile.vouchedBy && profile.vouchedBy.length > 0 && (
            <div className="mt-3 text-[11px] uppercase tracking-widest text-accent/90 font-semibold flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent" />
              vouched by {formatNames(profile.vouchedBy)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatNames(names: string[]): string {
  const first = names.slice(0, 3);
  if (first.length === 1) return first[0];
  if (first.length === 2) return `${first[0]} & ${first[1]}`;
  return `${first[0]}, ${first[1]} & ${first[2]}`;
}
