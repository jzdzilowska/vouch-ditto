"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initialDraftBio: string | null;
  currentBio: string | null;
  currentStatus: string;
  photoUrl: string | null;
  displayName: string;
  canSynthesize: boolean;
};

export default function ReviewClient({
  initialDraftBio,
  currentBio,
  currentStatus,
  photoUrl,
  displayName,
  canSynthesize,
}: Props) {
  const router = useRouter();
  // Bio shown in the editor: prefer current published bio, then latest draft, then "".
  const [bio, setBio] = useState<string>(currentBio || initialDraftBio || "");
  const [busyKind, setBusyKind] = useState<null | "regen" | "publish" | "save">(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function regenerate() {
    setBusyKind("regen");
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/synthesize", { method: "POST" });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || `Failed (${res.status})`);
      setBio(j.draft.draft_bio);
      setInfo("Fresh draft from your latest vouches.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusyKind(null);
    }
  }

  async function save(thenPublish: boolean) {
    setBusyKind(thenPublish ? "publish" : "save");
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          bio,
          ...(thenPublish ? { status: "live" } : {}),
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || `Failed (${res.status})`);
      if (thenPublish) {
        router.push("/discover");
        router.refresh();
        return;
      }
      setInfo("Saved.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusyKind(null);
    }
  }

  const wordCount = bio.trim() ? bio.trim().split(/\s+/).length : 0;
  const hasBio = !!bio.trim();

  return (
    <section className="space-y-4">
      {/* Preview card — shows what others will see */}
      <div className="rounded-3xl overflow-hidden bg-card border border-white/5 relative aspect-[3/4] max-h-[440px]">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={displayName} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-muted">no photo</div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-16">
          <div className="text-2xl font-display tracking-tight">{displayName}</div>
          <p className="text-sm leading-relaxed text-ink/90 line-clamp-4 mt-1">
            {bio || <span className="text-muted">Your bio will appear here.</span>}
          </p>
        </div>
        <div className="absolute top-3 left-3 text-[10px] uppercase tracking-widest bg-black/60 backdrop-blur rounded-full px-2 py-1 text-ink/80">
          preview
        </div>
      </div>

      {/* Editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label !mb-0">Bio</label>
          <span className={`text-xs ${wordCount > 130 ? "text-accent" : "text-muted"}`}>
            {wordCount} words {wordCount > 130 ? "(over 130)" : ""}
          </span>
        </div>
        <textarea
          className="input min-h-[180px] leading-relaxed"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder={canSynthesize ? "Tap 'Generate from vouches' to draft this from your friends' answers." : "Once friends submit, you'll see a draft here."}
        />
        {error && <div className="text-sm text-accent mt-2">{error}</div>}
        {info && <div className="text-sm text-emerald-400 mt-2">{info}</div>}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={regenerate}
          disabled={!canSynthesize || busyKind !== null}
          className="btn-secondary"
        >
          {busyKind === "regen" ? "Generating…" : initialDraftBio ? "↻ Regenerate" : "Generate from vouches"}
        </button>
        <button
          onClick={() => save(false)}
          disabled={!hasBio || busyKind !== null}
          className="btn-secondary"
        >
          {busyKind === "save" ? "Saving…" : "Save edits"}
        </button>
      </div>
      <button
        onClick={() => save(true)}
        disabled={!hasBio || busyKind !== null}
        className="btn-primary w-full"
      >
        {busyKind === "publish" ? "Publishing…" : currentStatus === "live" ? "Update & keep live" : "Approve & go live →"}
      </button>
    </section>
  );
}
