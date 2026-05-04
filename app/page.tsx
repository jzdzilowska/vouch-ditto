"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import GrainOverlay from "@/components/GrainOverlay";

const WHISPERS = [
  "she laughs at her own jokes",
  "loyal to a fault",
  "the one who texts back immediately",
  "horrible taste in movies, perfect taste in people",
  "makes strangers feel like old friends",
  "never splits the check — always just pays",
  "will absolutely cry at your wedding",
  "sends voice notes instead of texts",
  "remembers how you take your coffee",
  "the friend everyone secretly wants to date",
  "talks with her hands",
  "always the last one to leave",
];

const SUBTITLE = "let them write your dating profile.";

function useTypewriter(text: string, speed = 40, startDelay = 1200) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const delayTimer = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(delayTimer);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) return;

    const timer = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, speed);
    return () => clearTimeout(timer);
  }, [started, displayed, text, speed]);

  return displayed;
}

function FloatingWhispers() {
  const configs = useMemo(
    () =>
      WHISPERS.map((text, i) => ({
        text,
        x: `${5 + ((i * 37 + 13) % 80)}%`,
        y: `${8 + ((i * 23 + 7) % 75)}%`,
        size: 0.7 + (i % 4) * 0.15,
        opacity: 0.08 + (i % 5) * 0.04,
        duration: 6 + (i % 5) * 2,
        delay: i * 0.4,
        drift: 12 + (i % 3) * 8,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {configs.map(({ text, x, y, size, opacity, duration, delay, drift }, i) => (
        <motion.div
          key={i}
          className="absolute text-typewriter italic whitespace-nowrap"
          style={{
            left: x,
            top: y,
            fontSize: `${size}rem`,
            opacity: 0,
          }}
          animate={{
            y: [0, -drift, 0],
            opacity: [0, opacity, opacity, 0],
          }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          &ldquo;{text}&rdquo;
        </motion.div>
      ))}
    </div>
  );
}

const STEPS = [
  {
    n: "01",
    title: "you show up",
    body: "add a few photos. that\u2019s all you do.",
  },
  {
    n: "02",
    title: "they speak for you",
    body: "send a link to 2\u20133 friends. they answer three questions.",
  },
  {
    n: "03",
    title: "you become discoverable",
    body: "AI stitches their words into a profile that sounds like you.",
  },
];

export default function HomePage() {
  const subtitle = useTypewriter(SUBTITLE);

  return (
    <main className="relative overflow-hidden">
      <div className="gradient-bg" />
      <GrainOverlay />

      {/* ── Section 1: The Whisper ── */}
      <section className="relative z-10 min-h-screen flex flex-col">
        <header className="px-6 py-6 flex items-center justify-between max-w-5xl mx-auto w-full">
          <div className="font-display italic text-2xl tracking-tight text-white/90">
            vouch
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm">
              Log in
            </Link>
          </nav>
        </header>

        <div className="flex-1 relative flex items-center justify-center px-6">
          <FloatingWhispers />

          <motion.div
            className="relative z-10 text-center max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <h1 className="text-display text-4xl md:text-[3.4rem] leading-[1.1] text-ink mb-6">
              What do your friends say about you...{" "}
              <span className="text-blush">when you&rsquo;re not around?</span>
            </h1>

            <p className="text-typewriter text-white/40 text-sm md:text-base h-8 mb-10">
              {subtitle}
              <span className="inline-block w-[2px] h-[1em] bg-white/40 ml-0.5 align-middle animate-pulse" />
            </p>

            <Link
              href="/signup"
              className="btn-primary text-sm md:text-base shadow-[0_0_30px_rgba(255,255,255,0.08)]"
            >
              Let them tell your story
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="pb-10 text-center"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-white/20 text-xs text-typewriter tracking-widest">
            scroll
          </span>
        </motion.div>
      </section>

      {/* ── Section 2: The Steps ── */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 py-24">
        <div className="max-w-lg w-full space-y-16">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.8,
                delay: i * 0.15,
                ease: "easeOut",
              }}
            >
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-typewriter text-accent2 text-xs tracking-widest">
                  {step.n}
                </span>
                <span className="font-display italic text-2xl md:text-3xl text-ink">
                  {step.title}
                </span>
              </div>
              <p className="text-typewriter text-white/35 text-sm pl-10">
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Section 3: The Close ── */}
      <section className="relative z-10 min-h-[70vh] flex flex-col items-center justify-center px-6 py-24">
        <motion.div
          className="text-center max-w-lg"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2 }}
        >
          <p className="text-display text-2xl md:text-4xl text-ink leading-snug mb-12">
            &ldquo;The best things said about you are said by someone else.&rdquo;
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary">
              Get started
            </Link>
            <Link href="/login" className="btn-ghost text-white/50 hover:text-white/80">
              Log in
            </Link>
          </div>
        </motion.div>

        <footer className="mt-auto pt-16 pb-8 text-center">
          <div className="font-display italic text-lg text-white/20 mb-2">
            vouch
          </div>
          <p className="text-typewriter text-white/10 text-[0.6rem] tracking-widest">
            built as a demo
          </p>
        </footer>
      </section>
    </main>
  );
}
