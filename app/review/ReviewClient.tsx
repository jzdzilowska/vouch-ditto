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
    <section className="review-editor">
      <div className="review-editor-head">
        <label className="review-editor-label">Bio draft</label>
        <span className="review-editor-count">
          {wordCount} words {wordCount > 130 ? "(over 130)" : ""}
        </span>
      </div>
      <textarea
        className="review-editor-input"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder={
          canSynthesize
            ? "Tap 'Generate from vouches' to draft this from your friends' answers."
            : "Once friends submit, you'll see a draft here."
        }
      />
      {error && <div className="review-editor-error">{error}</div>}
      {info && <div className="review-editor-info">{info}</div>}

      <div className="review-actions-row">
        <button
          onClick={regenerate}
          disabled={!canSynthesize || busyKind !== null}
          className="review-action review-action--secondary"
        >
          {busyKind === "regen" ? "Generating..." : initialDraftBio ? "Regenerate" : "Generate from vouches"}
        </button>
        <button
          onClick={() => save(false)}
          disabled={!hasBio || busyKind !== null}
          className="review-action review-action--secondary"
        >
          {busyKind === "save" ? "Saving..." : "Save edits"}
        </button>
      </div>
      <button
        onClick={() => save(true)}
        disabled={!hasBio || busyKind !== null}
        className="review-action review-action--primary"
      >
        {busyKind === "publish" ? "Publishing..." : currentStatus === "live" ? "Update & keep live" : "Approve & go live"}
      </button>
      {!photoUrl && (
        <div className="review-editor-note">
          Add a main photo to make this review card fully visual.
        </div>
      )}
      {!displayName && (
        <div className="review-editor-note">
          Add your display name in onboarding for the cleanest final result.
        </div>
      )}
    </section>
  );
}
