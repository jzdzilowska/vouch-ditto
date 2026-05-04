"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const MAX_PHOTOS = 6;
const MIN_PHOTOS = 3;

type Photo = { url: string; path: string };

export default function OnboardingForm({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const supabase = createClient();
  const fileInput = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
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
    } catch (e: any) {
      setError(e.message ?? String(e));
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

  async function submit() {
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
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="phone-edge-to-edge relative w-full min-h-[100dvh] bg-[#0c0a09] text-ink overflow-hidden">
      <div className="relative z-[3] flex flex-col px-[26px]" style={{ paddingTop: 70, paddingBottom: 30, minHeight: "100dvh" }}>
        <div className="eyebrow" style={{ marginTop: 24 }}>
          step {step} of 4 · {step === 1 ? "photos" : "basics"}
        </div>

        {step === 1 && (
          <>
            <h1
              className="mt-3.5 text-white"
              style={{
                fontFamily: "var(--font-display), 'Fraunces', serif",
                fontWeight: 300,
                fontSize: 34,
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
              }}
            >
              Show us how{" "}
              <em
                style={{
                  fontFamily: "var(--font-italic), 'Instrument Serif', serif",
                  fontWeight: 400,
                  fontStyle: "italic",
                }}
              >
                you actually look
              </em>
              .
            </h1>
            <p
              className="mt-3 text-white/55"
              style={{ fontSize: 13.5, lineHeight: 1.5 }}
            >
              {MIN_PHOTOS}–{MAX_PHOTOS} photos. The first one becomes your hero.
            </p>

            <div className="grid grid-cols-3 gap-2 mt-6">
              {photos.map((p, i) => (
                <div
                  key={p.path}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <Image src={p.url} alt="" fill sizes="200px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur rounded-full text-xs w-6 h-6 grid place-items-center"
                    aria-label="remove"
                  >
                    ×
                  </button>
                  {i === 0 && (
                    <div
                      className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full text-white"
                      style={{
                        background: "linear-gradient(135deg, #d28865 0%, #8a3e2a 100%)",
                        fontFamily: "var(--font-typewriter), monospace",
                        fontSize: 8,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                      }}
                    >
                      main
                    </div>
                  )}
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="aspect-[3/4] rounded-xl grid place-items-center text-white/45 text-sm"
                  style={{ border: "1px dashed rgba(255,255,255,0.2)" }}
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

            {error && (
              <div className="text-sm text-accent mt-4" style={{ fontFamily: "var(--font-typewriter), monospace" }}>
                {error}
              </div>
            )}

            <div className="flex-1 min-h-[20px]" />

            <button
              className="cta-pill mt-6"
              disabled={photos.length < MIN_PHOTOS}
              onClick={() => setStep(2)}
            >
              {photos.length < MIN_PHOTOS
                ? `Add ${MIN_PHOTOS - photos.length} more to continue`
                : "Continue"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1
              className="mt-3.5 text-white"
              style={{
                fontFamily: "var(--font-display), 'Fraunces', serif",
                fontWeight: 300,
                fontSize: 34,
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
              }}
            >
              The{" "}
              <em
                style={{
                  fontFamily: "var(--font-italic), 'Instrument Serif', serif",
                  fontWeight: 400,
                  fontStyle: "italic",
                }}
              >
                basics
              </em>
              .
            </h1>
            <p className="mt-3 text-white/55" style={{ fontSize: 13.5, lineHeight: 1.5 }}>
              Your friends will write the rest.
            </p>

            <div className="mt-6 flex flex-col gap-1">
              <input
                className="whisper-input"
                placeholder="your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-4 mt-4">
                <input
                  className="whisper-input"
                  type="number"
                  min={18}
                  max={99}
                  placeholder="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                />
                <input
                  className="whisper-input"
                  placeholder="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <select
                  className="whisper-input"
                  style={{ paddingLeft: 0 }}
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
                  className="whisper-input"
                  value={lookingFor}
                  onChange={(e) => setLookingFor(e.target.value)}
                >
                  <option value="">looking for…</option>
                  <option>Women</option>
                  <option>Men</option>
                  <option>Everyone</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="text-sm text-accent mt-4" style={{ fontFamily: "var(--font-typewriter), monospace" }}>
                {error}
              </div>
            )}

            <div className="flex-1 min-h-[20px]" />

            <div className="flex flex-col gap-2 mt-6">
              <button className="cta-pill" disabled={busy || !displayName} onClick={submit}>
                {busy ? "Saving…" : "Create profile"}
              </button>
              <button
                onClick={() => setStep(1)}
                className="cta-secondary"
              >
                ← back to photos
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
