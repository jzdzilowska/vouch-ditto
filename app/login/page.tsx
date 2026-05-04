"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// Login — same Fraunces/whisper aesthetic as signup. Same Supabase
// signInWithPassword call. Redirects to ?next= or /dashboard.
export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <main className="phone-edge-to-edge relative w-full min-h-[100dvh] bg-[#0c0a09] text-ink overflow-hidden">
      <Link
        href="/"
        className="absolute z-10 text-white/60 hover:text-white text-2xl"
        style={{ top: 60, left: 16, padding: 8 }}
        aria-label="Back"
      >
        ‹
      </Link>

      <div className="relative z-[3] flex flex-col px-[26px]" style={{ paddingTop: 70, paddingBottom: 30, minHeight: "100dvh" }}>
        <div className="eyebrow" style={{ marginTop: 24 }}>
          welcome back
        </div>

        <h1
          className="mt-3.5 text-white"
          style={{
            fontFamily: "var(--font-display), 'Fraunces', serif",
            fontWeight: 300,
            fontSize: 38,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
          }}
        >
          Pick up where you{" "}
          <em
            style={{
              fontFamily: "var(--font-italic), 'Instrument Serif', serif",
              fontWeight: 400,
              fontStyle: "italic",
            }}
          >
            left off
          </em>
          .
        </h1>

        <form onSubmit={onSubmit} className="mt-8">
          <input
            className="whisper-input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            autoFocus
          />
          <input
            className="whisper-input"
            style={{ marginTop: 18 }}
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
          />

          {error && (
            <div className="mt-4 text-sm text-accent" style={{ fontFamily: "var(--font-typewriter), monospace" }}>
              {error}
            </div>
          )}

          <div className="flex-1 min-h-[40px]" />

          <button type="submit" className="cta-pill mt-10" disabled={busy || !email || !password}>
            {busy ? "Logging in…" : "Log in"}
          </button>

          <div className="text-center mt-4">
            <Link href="/signup" className="cta-secondary">
              I don&apos;t have an account yet
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
