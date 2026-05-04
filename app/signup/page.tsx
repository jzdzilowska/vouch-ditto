"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/onboarding";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="gradient-bg" />

      <div className="relative z-10 w-full max-w-sm px-6">
        <div className="text-center mb-10">
          <Link href="/" className="font-display italic text-3xl tracking-tight text-white/90 inline-block mb-8">
            vouch
          </Link>
          <h1 className="text-display text-3xl md:text-4xl text-ink mb-3">
            Let&apos;s help you<br />
            meet someone<br />
            who truly gets <em className="text-blush not-italic">you</em>
          </h1>
          <p className="text-typewriter text-white/40 text-sm mt-4">
            Find genuine connections built on shared<br />
            values, interests, and goals.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="at least 8 characters"
            />
          </div>

          {error && (
            <div className="text-typewriter text-sm text-accent text-center">{error}</div>
          )}

          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "Creating…" : "Continue with Email"}
          </button>
        </form>

        <div className="divider-text my-6">or continue with</div>

        <div className="space-y-3">
          <button className="btn-secondary w-full justify-between" disabled>
            <span>Continue With Apple</span>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.53-3.23 0-1.44.62-2.2.44-3.06-.4C3.79 16.17 4.36 9.02 8.93 8.76c1.26.07 2.13.72 2.91.76.89-.18 1.74-.87 2.97-.79 1.46.12 2.56.72 3.28 1.82-3.01 1.81-2.3 5.77.46 6.88-.56 1.47-1.29 2.92-2.5 4.85zM12.07 8.68c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
          </button>
          <button className="btn-secondary w-full justify-between" disabled>
            <span>Continue With Google</span>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </button>
        </div>

        <p className="text-center mt-8">
          <span className="text-typewriter text-white/30 text-xs">
            Already have an account?{" "}
            <Link href="/login" className="text-white/60 underline underline-offset-4 decoration-white/20 hover:text-white/80 transition">
              Log in
            </Link>
          </span>
        </p>

        <p className="text-center mt-6 text-typewriter text-white/15 text-[0.6rem] tracking-widest leading-relaxed">
          By continuing, you agree to Vouch&apos;s<br />
          Terms of Service and Privacy Policy
        </p>
      </div>
    </main>
  );
}
