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

      {/* Intimacy copy */}
      <div className="absolute left-0 right-0 px-[22px]" style={{ top: 78 }}>
        <div className="hero-copy max-w-[280px]">
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
      </div>

      {/* Wordmark — bottom-right, Peakr-style */}
      <div
        className="absolute text-right"
        style={{ right: 22, bottom: 220 }}
      >
        <div
          className="wordmark"
          style={{ fontSize: 64 }}
        >
          vouch<sup>®</sup>
        </div>
      </div>

      {/* CTA — white pill + tiny secondary link */}
      <div
        className="absolute left-[14px] right-[14px] flex flex-col items-center gap-[10px]"
        style={{ bottom: 50 }}
      >
        <Link href="/signup" className="cta-pill" aria-label="Get started">
          <span className="cta-pill__hearts cta-pill__hearts--left" aria-hidden>
            <HeartIcon /><HeartIcon /><HeartIcon /><HeartIcon /><HeartIcon /><HeartIcon /><HeartIcon /><HeartIcon /><HeartIcon /><HeartIcon />
          </span>
          <span className="cta-pill__label">Get started</span>
          <span className="cta-pill__hearts cta-pill__hearts--right" aria-hidden>
            <HeartIcon /><HeartIcon /><HeartIcon /><HeartIcon /><HeartIcon /><HeartIcon /><HeartIcon /><HeartIcon /><HeartIcon /><HeartIcon />
          </span>
        </Link>
      </div>
    </main>
  );
}
