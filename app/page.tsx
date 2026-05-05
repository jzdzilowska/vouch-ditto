"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import HeroBackdrop from "@/components/HeroBackdrop";
import GrainOverlay from "@/components/GrainOverlay";

const MIN_PHOTOS = 3;
const MAX_PHOTOS = 6;
type Photo = { url: string; path: string };
type Step = "intro" | "welcome" | "photos" | "basics";

function HeartIcon() {
  return (
    <svg className="cta-heart" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 21s-8-5.5-8-11a5 5 0 0 1 8-3 5 5 0 0 1 8 3c0 5.5-8 11-8 11z" />
    </svg>
  );
}

// Landing — sensual warm hero with a 4-step inline flow that cross-fades in place:
// intro → welcome (sign up) → photos (upload) → basics (profile metadata) → /dashboard.
export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<Step>("intro");
  const fileInput = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [lookingFor, setLookingFor] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleWelcomeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      // Try sign up first; ignore "already registered" so returning users fall through to sign-in.
      const { error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback?next=/dashboard`,
        },
      });
      if (signUpErr && !/already.*registered|user already|exists/i.test(signUpErr.message)) {
        throw signUpErr;
      }
      // Always follow with sign-in so we land with an active session
      // (covers email-confirmation-required and returning-user cases).
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) throw signInErr;
      setStep("photos");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const remaining = MAX_PHOTOS - photos.length;
      const arr = Array.from(files).slice(0, remaining);
      const uploaded: Photo[] = [];
      for (const f of arr) {
        const ext = f.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("profile-photos")
          .upload(path, f, { cacheControl: "3600", upsert: false, contentType: f.type });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("profile-photos").getPublicUrl(path);
        uploaded.push({ path, url: pub.publicUrl });
      }
      setPhotos((p) => [...p, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function removePhoto(idx: number) {
    const p = photos[idx];
    setPhotos((arr) => arr.filter((_, i) => i !== idx));
    await supabase.storage.from("profile-photos").remove([p.path]).catch(() => {});
  }

  async function handleBasicsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          age: age === "" ? null : age,
          city,
          gender,
          looking_for: lookingFor,
          photo_urls: photos.map((p) => p.url),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Failed (${res.status})`);
      }
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="phone-edge-to-edge relative w-full h-full min-h-[100dvh] overflow-hidden bg-black">
      <HeroBackdrop />
      <GrainOverlay opacity={0.2} />

      {/* Stage: all screens occupy the same centered region; they cross-fade. */}
      <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
        {/* 1) Intro */}
        <div className="cta-screen cta-screen--intro" data-active={step === "intro"}>
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
          <button
            type="button"
            onClick={() => setStep("welcome")}
            className="cta-pill"
            aria-label="Are you ready?"
          >
            <span className="cta-pill__label">Are you ready?</span>
            <span className="cta-pill__heart" aria-hidden>
              <HeartIcon />
            </span>
          </button>
        </div>

        {/* 2) Welcome — email + password */}
        <div className="cta-screen cta-screen--welcome" data-active={step === "welcome"}>
          <h1 className="welcome-heading">
            One circle away <em>from your meant to be.</em>
          </h1>
          <form className="welcome-form" onSubmit={handleWelcomeSubmit}>
            <input
              className="welcome-input"
              type="email"
              autoComplete="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="welcome-input"
              type="password"
              autoComplete="new-password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <div className="cta-error">{error}</div>}
            <button
              type="submit"
              className="cta-pill cta-pill--ready"
              disabled={busy}
              aria-label="I'm ready"
            >
              <span className="cta-pill__label">{busy ? "…" : "I’m ready"}</span>
              <span className="cta-pill__heart" aria-hidden>
                <HeartIcon />
              </span>
            </button>
          </form>
        </div>

        {/* 3) Photos */}
        <div className="cta-screen cta-screen--photos" data-active={step === "photos"}>
          <h1 className="welcome-heading">
            Show us <em>how you actually look.</em>
          </h1>

          <div className="photo-grid">
            {photos.map((p, i) => (
              <div key={p.path} className="photo-tile">
                <Image src={p.url} alt="" fill sizes="100px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="photo-remove"
                  aria-label="remove"
                >
                  ×
                </button>
                {i === 0 && <div className="photo-main-badge">main</div>}
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="photo-add"
                aria-label="add photo"
              >
                {uploading ? "…" : "+"}
              </button>
            )}
          </div>

          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {error && <div className="cta-error">{error}</div>}

          <button
            type="button"
            onClick={() => setStep("basics")}
            className="cta-pill cta-pill--ready"
            disabled={photos.length < MIN_PHOTOS}
            aria-label="Take me further"
          >
            <span className="cta-pill__label">
              {photos.length < MIN_PHOTOS
                ? `${MIN_PHOTOS - photos.length} more to continue`
                : "Take me further"}
            </span>
            <span className="cta-pill__heart" aria-hidden>
              <HeartIcon />
            </span>
          </button>
        </div>

        {/* 4) Basics */}
        <div className="cta-screen cta-screen--basics" data-active={step === "basics"}>
          <h1 className="welcome-heading">
            All we need. <em>Your friends will fill the rest.</em>
          </h1>
          <form className="welcome-form" onSubmit={handleBasicsSubmit}>
            <input
              className="welcome-input"
              placeholder="your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            <div className="welcome-row">
              <input
                className="welcome-input"
                type="number"
                min={18}
                max={99}
                placeholder="age"
                value={age}
                onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
              />
              <input
                className="welcome-input"
                placeholder="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="welcome-row">
              <select
                className="welcome-input welcome-select"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">i am…</option>
                <option>Woman</option>
                <option>Man</option>
                <option>Nonbinary</option>
                <option>Prefer not to say</option>
              </select>
              <select
                className="welcome-input welcome-select"
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
              >
                <option value="">looking for…</option>
                <option>Women</option>
                <option>Men</option>
                <option>Everyone</option>
              </select>
            </div>
            {error && <div className="cta-error">{error}</div>}
            <button
              type="submit"
              className="cta-pill cta-pill--ready"
              disabled={busy || !displayName}
              aria-label="Create profile"
            >
              <span className="cta-pill__label">{busy ? "saving…" : "Create profile"}</span>
              <span className="cta-pill__heart" aria-hidden>
                <HeartIcon />
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* Wordmark — bottom-right */}
      <div className="absolute" style={{ right: 25, bottom: 60 }}>
        <div className="wordmark" style={{ fontSize: 58 }}>
          vouch<sup>®</sup>
        </div>
      </div>
    </main>
  );
}
