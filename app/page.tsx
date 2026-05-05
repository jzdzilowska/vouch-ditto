"use client";

import Link from "next/link";
import HeroBackdrop from "@/components/HeroBackdrop";
import GrainOverlay from "@/components/GrainOverlay";

function HeartIcon() {
  return (
    <svg className="cta-heart" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 21s-8-5.5-8-11a5 5 0 0 1 8-3 5 5 0 0 1 8 3c0 5.5-8 11-8 11z" />
    </svg>
  );
}

// Landing — sensual warm hero, intimacy copy, Fraunces wordmark bottom-right,
// "Get started" CTA flanked by heart icon rows.
export default function HomePage() {
  return (
    <main className="phone-edge-to-edge relative w-full h-full min-h-[100dvh] overflow-hidden bg-black">
      <HeroBackdrop />
      <GrainOverlay opacity={0.2} />

      {/* Centered CTA stack — copy + Get started, vertically and horizontally centered */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
        <div className="hero-copy max-w-[300px]" style={{ textAlign: "center" }}>
          Let yourself be seen{" "}
          <em
            style={{
              fontFamily: "var(--font-italic), 'Instrument Serif', serif",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 16,
            }}
          >
            for who you are.
          </em>
        </div>
        <Link href="/signup" className="cta-pill" aria-label="Get started">
          <span className="cta-pill__label">Are you ready?</span>
          <span className="cta-pill__heart" aria-hidden>
            <HeartIcon />
          </span>
        </Link>
      </div>

      {/* Wordmark — bottom-right, lifted up slightly */}
      <div className="absolute" style={{ right: 25, bottom: 60 }}>
        <div className="wordmark" style={{ fontSize: 58 }}>
          vouch<sup>®</sup>
        </div>
      </div>
    </main>
  );
}
