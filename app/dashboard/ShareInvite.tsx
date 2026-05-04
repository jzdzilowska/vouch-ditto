"use client";

import { useState, useEffect } from "react";
import { inviteUrl } from "@/lib/site";

export default function ShareInvite({ slug, displayName }: { slug: string; displayName: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(inviteUrl(slug));
  }, [slug]);

  async function copy() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  // sms: scheme works on iOS/macOS to open Messages with prefilled body.
  const smsBody = encodeURIComponent(
    `i'm building my dating profile on vouch and want you to write part of it (3 quick questions, takes 60s). ${url}`
  );
  const smsHref = `sms:&body=${smsBody}`;

  // Native share API for everything else.
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
    <div>
      <div className="flex items-center gap-2 mb-3">
        <code className="flex-1 truncate bg-bg border border-white/10 rounded-xl px-3 py-2.5 text-sm">
          {url || "loading…"}
        </code>
        <button onClick={copy} className="btn-secondary px-4 py-2.5 text-sm">
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="flex gap-2">
        <a href={smsHref} className="btn-primary flex-1 text-sm">
          Send via iMessage
        </a>
        <button onClick={nativeShare} className="btn-secondary text-sm">
          Share…
        </button>
      </div>
    </div>
  );
}
