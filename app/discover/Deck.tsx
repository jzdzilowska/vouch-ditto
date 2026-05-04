"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileCard, { type ProfileCardData } from "@/components/ProfileCard";

// Swipe deck — full-bleed card stack with "pass" / "vouch back" actions
// matching the design's ProfileScreen ActionButtons (pill-shaped,
// white primary + glass-blur secondary).
export default function Deck({ cards: initial }: { cards: ProfileCardData[] }) {
  const [cards, setCards] = useState(initial);
  const [pendingDir, setPendingDir] = useState<"like" | "pass" | null>(null);
  const [matchToast, setMatchToast] = useState<string | null>(null);
  const top = cards[0];

  async function decide(direction: "like" | "pass") {
    if (!top || pendingDir) return;
    setPendingDir(direction);
    const targetId = top.id;
    const targetName = top.display_name;

    // Optimistic — pop card immediately
    setCards((arr) => arr.slice(1));

    try {
      const res = await fetch("/api/swipe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ swiped_profile_id: targetId, direction }),
      });
      const j = await res.json().catch(() => ({}));
      if (j?.matched) {
        setMatchToast(`a match with ${targetName}.`);
        setTimeout(() => setMatchToast(null), 3500);
      }
    } catch {
      /* keep optimistic UI */
    } finally {
      setPendingDir(null);
    }
  }

  return (
    <>
      {/* Card stack — fills the screen */}
      <div className="absolute inset-0">
        <AnimatePresence mode="popLayout">
          {/* Peek at the next card behind */}
          {cards[1] && (
            <motion.div
              key={`peek-${cards[1].id}`}
              initial={{ scale: 0.92, opacity: 0.5 }}
              animate={{ scale: 0.94, opacity: 0.6 }}
              className="absolute inset-0 -z-10"
            >
              <ProfileCard profile={cards[1]} />
            </motion.div>
          )}
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
        </AnimatePresence>
      </div>

      {/* Action bar — over the card, glass + white */}
      <div
        className="absolute z-40 flex justify-center gap-3.5"
        style={{ left: 0, right: 0, bottom: 44 }}
      >
        <ActionButton label="pass" onClick={() => decide("pass")} disabled={!top || !!pendingDir} />
        <ActionButton label="vouch back" primary onClick={() => decide("like")} disabled={!top || !!pendingDir} />
      </div>

      {/* Match toast */}
      <AnimatePresence>
        {matchToast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="absolute z-50 px-5 py-3 rounded-full"
            style={{
              bottom: 130,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(168,216,168,0.16)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(168,216,168,0.35)",
              color: "#d6f0d6",
              fontFamily: "var(--font-italic), 'Instrument Serif', serif",
              fontStyle: "italic",
              fontSize: 18,
            }}
          >
            {matchToast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ActionButton({
  label,
  primary,
  onClick,
  disabled,
}: {
  label: string;
  primary?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-full transition active:scale-[0.97] disabled:opacity-40"
      style={{
        padding: "15px 28px",
        minWidth: 130,
        background: primary ? "#fff" : "rgba(0,0,0,0.4)",
        backdropFilter: primary ? "none" : "blur(8px)",
        border: primary ? "none" : "1px solid rgba(255,255,255,0.4)",
        color: primary ? "#111" : "#fff",
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: "-0.005em",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {label}
    </button>
  );
}
