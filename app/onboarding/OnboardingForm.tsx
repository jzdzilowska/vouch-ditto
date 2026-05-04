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
    <main className="min-h-screen px-6 py-10 max-w-xl mx-auto">
      <div className="mb-8">
        <div className="text-xs text-muted">{userEmail}</div>
        <h1 className="text-3xl font-display tracking-tight mt-1">Set up your profile</h1>
        <div className="flex gap-2 mt-4">
          <div className={`h-1 flex-1 rounded ${step >= 1 ? "bg-accent" : "bg-white/10"}`} />
          <div className={`h-1 flex-1 rounded ${step >= 2 ? "bg-accent" : "bg-white/10"}`} />
        </div>
      </div>

      {step === 1 && (
        <section>
          <h2 className="text-xl font-semibold mb-1">Add {MIN_PHOTOS}–{MAX_PHOTOS} photos</h2>
          <p className="text-muted text-sm mb-4">Pick a great main shot. The first photo becomes your hero.</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {photos.map((p, i) => (
              <div key={p.path} className="relative aspect-[3/4] bg-card rounded-xl overflow-hidden border border-white/5">
                <Image src={p.url} alt="" fill sizes="200px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur rounded-full text-xs w-6 h-6 grid place-items-center"
                  aria-label="remove"
                >
                  ×
                </button>
                {i === 0 && <div className="absolute bottom-1.5 left-1.5 text-[10px] bg-accent rounded-full px-2 py-0.5">main</div>}
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="aspect-[3/4] rounded-xl border-2 border-dashed border-white/15 grid place-items-center text-muted hover:border-white/30"
              >
                {uploading ? "Uploading…" : "+ Add"}
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
          {error && <div className="text-sm text-accent mb-3">{error}</div>}
          <button
            className="btn-primary w-full"
            disabled={photos.length < MIN_PHOTOS}
            onClick={() => setStep(2)}
          >
            Continue ({photos.length}/{MIN_PHOTOS} min)
          </button>
        </section>
      )}

      {step === 2 && (
        <section>
          <h2 className="text-xl font-semibold mb-1">A few basics</h2>
          <p className="text-muted text-sm mb-4">Your friends will write the rest.</p>
          <div className="space-y-3">
            <div>
              <label className="label">Name</label>
              <input className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Age</label>
                <input className="input" type="number" min={18} max={99} value={age}
                  onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
              <div>
                <label className="label">City</label>
                <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Gender</label>
                <select className="input" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="">—</option>
                  <option>Woman</option>
                  <option>Man</option>
                  <option>Nonbinary</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="label">Looking for</label>
                <select className="input" value={lookingFor} onChange={(e) => setLookingFor(e.target.value)}>
                  <option value="">—</option>
                  <option>Women</option>
                  <option>Men</option>
                  <option>Everyone</option>
                </select>
              </div>
            </div>
            {error && <div className="text-sm text-accent">{error}</div>}
            <div className="flex gap-2 pt-2">
              <button className="btn-secondary flex-1" onClick={() => setStep(1)}>Back</button>
              <button
                className="btn-primary flex-1"
                disabled={busy || !displayName}
                onClick={submit}
              >
                {busy ? "Saving…" : "Create profile"}
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
