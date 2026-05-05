"use client";

import { useState, useEffect } from "react";
import { inviteUrl } from "@/lib/site";
import HeartIcon from "@/components/HeartIcon";

// Share invite — minimal pill containing the link and a copy chip,
// then the same cta-pill heart-hover button used on the landing page.
// Same sms: handoff and Web-Share fallback as before.
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
  const [hasNativeShare, setHasNativeShare] = useState(false);

  useEffect(() => {
    const full = inviteUrl(slug);
    setUrl(full);
    setShortUrl(full.replace(/^https?:\/\//, ""));
    setHasNativeShare(typeof navigator !== "undefined" && !!navigator.share);
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
    `Would you vouch for me? ${url}`
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
    <div className="dash-share">
      <div className="dash-link">
        <span className="dash-link__url" title={url}>
          {shortUrl || "loading…"}
        </span>
        <button onClick={copy} className="dash-link__copy" type="button">
          {copied ? <em>copied.</em> : "copy"}
        </button>
      </div>

      <a href={smsHref} className="cta-pill" aria-label="Send via iMessage">
        <span className="cta-pill__label">Send via iMessage</span>
        <span className="cta-pill__heart" aria-hidden>
          <HeartIcon />
        </span>
      </a>

      {hasNativeShare && (
        <button onClick={nativeShare} className="cta-secondary" type="button">
          or share another way
        </button>
      )}
    </div>
  );
}
