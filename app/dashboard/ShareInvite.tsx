"use client";

import { useState, useEffect } from "react";
import { inviteUrl } from "@/lib/site";

// Invite-link preview row + iMessage CTA. Visual matches the design's
// InviteScreen footer (mono "LINK" eyebrow, faint card, copy chip),
// then the white pill below for the iOS sms: handoff.
export default function ShareInvite({
  slug,
  displayName,
}: {
  slug: string;
  displayName: string;
}) {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const full = inviteUrl(slug);
    setUrl(full);
    setShortUrl(full.replace(/^https?:\/\//, ""));
  }, [slug]);

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  const smsBody = encodeURIComponent(
    `i'm building my dating profile on vouch and want you to write part of it (3 quick questions, takes 60s). ${url}`
  );
  const smsHref = `sms:&body=${smsBody}`;

  async function nativeShare() {
    if (!url) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Help write ${displayName}'s dating profile`,
          text: `${displayName} wants you to vouch for them.`,
          url,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      copy();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* link card */}
      <div
        className="flex items-center gap-2.5 px-3.5 py-3 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <span
          className="flex-shrink-0 text-white/45"
          style={{
            fontFamily: "var(--font-typewriter), monospace",
            fontSize: 10,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          link
        </span>
        <span
          className="flex-1 text-white/85 truncate text-[13px]"
          title={url}
        >
          {shortUrl || "loading…"}
        </span>
        <button
          onClick={copy}
          className="bg-transparent text-white border rounded-full px-3 py-1.5 text-[11px] cursor-pointer hover:bg-white/5 transition"
          style={{
            borderColor: "rgba(255,255,255,0.18)",
            fontFamily: "var(--font-typewriter), monospace",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          {copied ? "✓" : "copy"}
        </button>
      </div>

      {/* CTA: real iMessage handoff via sms: URL scheme */}
      <a href={smsHref} className="cta-pill">
        Send via iMessage
      </a>

      {/* Tertiary native-share fallback (Android / non-iOS) */}
      {typeof navigator !== "undefined" && (
        <button
          onClick={nativeShare}
          className="cta-secondary"
        >
          Or share another way
        </button>
      )}
    </div>
  );
}
