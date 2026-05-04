import Link from "next/link";
import HeroBackdrop from "@/components/HeroBackdrop";
import Chip, { PREMISE_CHIPS } from "@/components/Chip";

// Landing — ported from design bundle. Sensual warm hero, chip row,
// "intimacy" copy, Fraunces wordmark bottom-right, white CTA pill +
// secondary "I already have an account" link.
export default function HomePage() {
  return (
    <main className="phone-edge-to-edge relative w-full h-full min-h-[100dvh] overflow-hidden bg-black">
      <HeroBackdrop variant="warm" />

      {/* Top chip row + intimacy copy */}
      <div className="absolute left-0 right-0 px-[22px]" style={{ top: 78 }}>
        <div className="chip-row">
          {PREMISE_CHIPS.map((c) => (
            <Chip key={c.label} label={c.label} icon={c.icon} />
          ))}
        </div>
        <div className="hero-copy mt-[18px] max-w-[280px]">
          The people who know you,{" "}
          <em
            style={{
              fontFamily: "var(--font-italic), 'Instrument Serif', serif",
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            write you.
          </em>
          <br />
          You just show up.
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
        <Link href="/signup" className="cta-pill">
          Get started
        </Link>
        <Link href="/login" className="cta-secondary">
          I already have an account
        </Link>
      </div>
    </main>
  );
}
