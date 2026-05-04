"use client";

import { useEffect, useRef, useState } from "react";

type Bubble =
  | { from: "vouch"; text: string; key: string }
  | { from: "me"; text: string; key: string };

type Step =
  | "intro"
  | "ask_name"
  | "ask_relationship"
  | "ask_q1"
  | "ask_q2"
  | "ask_q3"
  | "submitting"
  | "done"
  | "error";

const TYPING_MS = 900;
const BETWEEN_MS = 350;

export default function FriendChat({
  profileId,
  displayName,
  avatarUrl,
}: {
  profileId: string;
  displayName: string;
  avatarUrl: string | null;
}) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [step, setStep] = useState<Step>("intro");
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Captured answers
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");

  // Auto-scroll to bottom on new bubble / typing toggle.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [bubbles, typing]);

  // Initial intro sequence: kick off the conversation.
  useEffect(() => {
    let cancel = false;
    (async () => {
      await sendBot(`hey! 👋`, cancelGuard(() => cancel));
      await sendBot(
        `${displayName} is making their dating profile and asked you to vouch for them 💌`,
        cancelGuard(() => cancel)
      );
      await sendBot(`it's 4 quick questions, takes a min. cool?`, cancelGuard(() => cancel));
      await sendBot(`first — what should I call you?`, cancelGuard(() => cancel));
      if (!cancel) setStep("ask_name");
    })();
    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cancelGuard(check: () => boolean) {
    return check;
  }

  async function sendBot(text: string, cancelled?: () => boolean) {
    setTyping(true);
    await sleep(TYPING_MS);
    if (cancelled?.()) return;
    setTyping(false);
    setBubbles((b) => [...b, { from: "vouch", text, key: rand() }]);
    await sleep(BETWEEN_MS);
  }

  function pushMe(text: string) {
    setBubbles((b) => [...b, { from: "me", text, key: rand() }]);
  }

  async function onSend() {
    const value = input.trim();
    if (!value || typing) return;

    // Validate per step
    if (step === "ask_name" && value.length > 60) return;
    if (step === "ask_relationship" && value.length > 80) return;
    if ((step === "ask_q1" || step === "ask_q2" || step === "ask_q3") && value.length > 280) return;

    pushMe(value);
    setInput("");

    switch (step) {
      case "ask_name": {
        setName(value);
        setStep("intro");
        await sendBot(`nice to meet you, ${firstName(value)} ✨`);
        await sendBot(`how do you know ${displayName}? (e.g. "best friend since college")`);
        setStep("ask_relationship");
        break;
      }
      case "ask_relationship": {
        setRelationship(value);
        setStep("intro");
        await sendBot(`got it. ok here we go.`);
        await sendBot(`1/3 — describe ${displayName} in 3 words.`);
        setStep("ask_q1");
        break;
      }
      case "ask_q1": {
        setQ1(value);
        setStep("intro");
        await sendBot(`love that.`);
        await sendBot(`2/3 — what's their idea of a perfect first date?`);
        setStep("ask_q2");
        break;
      }
      case "ask_q2": {
        setQ2(value);
        setStep("intro");
        await sendBot(`mmmm okay.`);
        await sendBot(
          `last one — 3/3: what's something a date wouldn't notice on the first night, but really should know about ${displayName}?`
        );
        setStep("ask_q3");
        break;
      }
      case "ask_q3": {
        const ans = value;
        setQ3(ans);
        setStep("submitting");
        await sendBot(`saving…`);
        try {
          const res = await fetch("/api/friend/submit", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              profile_id: profileId,
              friend_name: name,
              friend_relationship: relationship,
              q1_three_words: q1,
              q2_perfect_date: q2,
              q3_secret_strength: ans,
            }),
          });
          if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            throw new Error(j.error || `Failed (${res.status})`);
          }
          await sendBot(`done 🙌`);
          await sendBot(
            `${displayName} will see your vouch when they review their profile. thanks for being a good friend.`
          );
          setStep("done");
        } catch (e: any) {
          await sendBot(`hmm — couldn't save that: ${e.message}. tap send to try again.`);
          setStep("ask_q3"); // allow retry
        }
        break;
      }
      default:
        break;
    }
  }

  const placeholder = placeholderFor(step);
  const disabled = typing || step === "submitting" || step === "done" || step === "intro";

  return (
    <div className="phone-edge-to-edge w-full h-full min-h-[100dvh] flex flex-col bg-[#0B0B0F]">
      {/* iOS-style status header */}
      <div className="sticky top-0 z-10 backdrop-blur bg-[#0B0B0F]/80 border-b border-white/5">
        <div className="max-w-md mx-auto px-4 pt-3 pb-3 flex items-center gap-3">
          <div className="text-[15px] text-accent2 font-semibold">‹ Messages</div>
          <div className="flex-1 flex flex-col items-center -ml-12">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 mb-0.5">
              {avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="text-[11px] text-ink/90 leading-none">vouch</div>
            <div className="text-[10px] text-muted leading-tight mt-0.5">
              about {displayName}
            </div>
          </div>
        </div>
      </div>

      {/* Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 pt-3 pb-4 max-w-md mx-auto w-full">
        <DateStamp />
        {bubbles.map((b) =>
          b.from === "vouch" ? <BubbleIn key={b.key} text={b.text} /> : <BubbleOut key={b.key} text={b.text} />
        )}
        {typing && <Typing />}
        {step === "done" && (
          <div className="text-center text-[11px] text-muted mt-6 mb-2">
            you can close this window now
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="sticky bottom-0 backdrop-blur bg-[#0B0B0F]/80 border-t border-white/5 pb-[env(safe-area-inset-bottom,0px)]">
        <div className="max-w-md mx-auto px-3 py-2.5 flex items-end gap-2">
          <div className="flex-1 bg-card border border-white/10 rounded-2xl px-3 py-2 min-h-[40px] flex items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full bg-transparent text-[15px] text-ink placeholder:text-muted/70 focus:outline-none disabled:opacity-50"
              autoFocus
            />
          </div>
          <button
            onClick={onSend}
            disabled={disabled || !input.trim()}
            aria-label="Send"
            className="w-9 h-9 rounded-full bg-[#0A84FF] text-white grid place-items-center disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 14V2M8 2L3 7M8 2l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function BubbleIn({ text }: { text: string }) {
  return (
    <div className="flex justify-start mb-1.5">
      <div className="max-w-[78%] bg-[#26262C] text-ink rounded-2xl rounded-bl-md px-3.5 py-2 text-[15px] leading-snug whitespace-pre-wrap">
        {text}
      </div>
    </div>
  );
}

function BubbleOut({ text }: { text: string }) {
  return (
    <div className="flex justify-end mb-1.5">
      <div className="max-w-[78%] bg-[#0A84FF] text-white rounded-2xl rounded-br-md px-3.5 py-2 text-[15px] leading-snug whitespace-pre-wrap">
        {text}
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div className="flex justify-start mb-1.5">
      <div className="bg-[#26262C] text-ink rounded-2xl rounded-bl-md px-3.5 py-2.5">
        <div className="flex items-center gap-1">
          <Dot delay="0ms" />
          <Dot delay="150ms" />
          <Dot delay="300ms" />
        </div>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full bg-muted inline-block"
      style={{ animation: "vouchTypingDot 1.2s infinite", animationDelay: delay }}
    />
  );
}

function DateStamp() {
  return (
    <div className="text-center text-[11px] text-muted mt-2 mb-3">
      <span className="font-semibold text-ink/70">Today</span>{" "}
      <span>
        {new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
      </span>
    </div>
  );
}

function placeholderFor(step: Step): string {
  switch (step) {
    case "ask_name": return "your name…";
    case "ask_relationship": return "best friend / coworker / sister…";
    case "ask_q1": return "smart, weird, kind…";
    case "ask_q2": return "natural wine bar then a walk…";
    case "ask_q3": return "the secret thing…";
    case "submitting": return "saving…";
    case "done": return "all set ✓";
    default: return "iMessage";
  }
}

function firstName(s: string) {
  return s.trim().split(/\s+/)[0];
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function rand() {
  return Math.random().toString(36).slice(2);
}
