"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function PresentationMockButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>("");

  const enabled =
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_ENABLE_MOCK_BUTTON === "true";

  // Keep it unobtrusive: only show where it's useful.
  const visibleOnPath =
    pathname === "/dashboard" || pathname?.startsWith("/review") || pathname?.startsWith("/discover");

  if (!enabled || !visibleOnPath) return null;

  async function runPrefill() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/mock/prefill-friend-submissions", {
        method: "POST",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `Failed (${res.status})`);
      setMessage("Mock vouches loaded");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
      setTimeout(() => setMessage(""), 1800);
    }
  }

  return (
    <div className="fixed top-4 right-4 z-[1000] flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={runPrefill}
        disabled={busy}
        className="rounded-full border border-white/30 bg-black/70 px-3 py-1.5 text-[11px] text-white backdrop-blur-md hover:bg-black/85 disabled:opacity-50"
      >
        {busy ? "Loading…" : "Mock vouches"}
      </button>
      {message ? (
        <div className="rounded-full bg-black/80 px-2 py-1 text-[10px] text-white/85">
          {message}
        </div>
      ) : null}
    </div>
  );
}

