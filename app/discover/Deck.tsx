"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileCard, { type ProfileCardData } from "@/components/ProfileCard";

export default function Deck({ cards: initial }: { cards: ProfileCardData[] }) {
  const [cards, setCards] = useState(initial);
  const [pendingDir, setPendingDir] = useState<"like" | "pass" | null>(null);
  const [matchToast, setMatchToast] = useState<string | null>(null);
  const top = cards[0];

  async function decide(direction: "like" | "pass") {
    if (!top || pendingDir) return;
    setPendingDir(direction);
    const targetId = top.id;

    // Optimistic — pop card immediately, animation handles by AnimatePresence
    setCards((arr) => arr.slice(1));

    try {
      const res = await fetch("/api/swipe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ swiped_profile_id: targetId, direction }),
      });
      const j = await res.json().catch(() => ({}));
      if (j?.matched) {
        setMatchToast(`it's a match with ${top.display_name} 💌`);
        setTimeout(() => setMatchToast(null), 3500);
      }
    } catch {
      /* swallow — kept the optimistic UI */
    } finally {
      setPendingDir(null);
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Card stack */}
      <div className="relative flex-1 mb-4 min-h-[440px]">
        <AnimatePresence mode="popLayout">
          {top && (
            <motion.div
              key={top.id}
              initial={{ scale: 0.96, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{
                x: pendingDir === "like" ? 400 : pendingDir === "pass" ? -400 : 0,
                rotate: pendingDir === "like" ? 14 : pendingDir === "pass" ? -14 : 0,
                opacity: 0,
                transition: { duration: 0.32 },
              }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="absolute inset-0"
            >
              <ProfileCard profile={top} />
            </motion.div>
          )}
          {/* Peek at the next card behind */}
          {cards[1] && (
            <motion.div
              key={`peek-${cards[1].id}`}
              initial={{ scale: 0.92, opacity: 0.4 }}
              animate={{ scale: 0.94, opacity: 0.6 }}
              className="absolute inset-0 -z-10"
            >
              <ProfileCard profile={cards[1]} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-center gap-6 pb-4">
        <ActionButton kind="pass" onClick={() => decide("pass")} disabled={!top || !!pendingDir} />
        <ActionButton kind="like" onClick={() => decide("like")} disabled={!top || !!pendingDir} />
      </div>

      {/* Match toast */}
      <AnimatePresence>
        {matchToast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 inset-x-0 mx-auto w-fit bg-accent text-white px-5 py-3 rounded-full shadow-2xl text-sm font-semibold"
          >
            {matchToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionButton({
  kind, onClick, disabled,
}: { kind: "pass" | "like"; onClick: () => void; disabled?: boolean }) {
  const isLike = kind === "like";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={isLike ? "Like" : "Pass"}
      className={`w-16 h-16 rounded-full grid place-items-center text-2xl font-light transition active:scale-95 disabled:opacity-30 ${
        isLike
          ? "bg-accent text-white shadow-[0_8px_24px_rgba(255,90,120,.35)]"
          : "bg-card text-ink/80 border border-white/10"
      }`}
    >
      {isLike ? "♥" : "✕"}
    </button>
  );
}
