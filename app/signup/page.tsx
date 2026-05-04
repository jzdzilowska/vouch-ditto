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
    // If email confirmation is disabled in Supabase, signUp returns a session — push.
    // Otherwise router push goes to a "check your email" UX.
    router.push(next);
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-2xl tracking-tight inline-block mb-8">vouch</Link>
        <h1 className="text-2xl font-semibold mb-1">Create your account</h1>
        <p className="text-muted text-sm mb-6">Photos and basics next, then your friends do the rest.</p>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="at least 8 characters" />
          </div>
          {error && <div className="text-sm text-accent">{error}</div>}
          <button className="btn-primary w-full" disabled={busy}>{busy ? "Creating…" : "Continue"}</button>
        </form>

        <p className="text-sm text-muted mt-6">
          Already have an account? <Link href="/login" className="text-ink underline">Log in</Link>
        </p>
      </div>
    </main>
  );
}
