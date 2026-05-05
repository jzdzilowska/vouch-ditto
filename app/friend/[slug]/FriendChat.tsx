"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
      await sendBot(`hey! 👋`, () => cancel);
      await sendBot(
        `${displayName} is making their dating profile and asked you to vouch for them 💌`,
        () => cancel
      );
      await sendBot(`it’s 4 quick questions, takes a min.`, () => cancel);
      await sendBot(`first - what should I call you?`, () => cancel);
      if (!cancel) setStep("ask_name");
    })();
    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        await sendBot(`how do you know ${displayName}? (e.g. “best friend since college”)`);
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
        await sendBot(`2/3 — what’s their idea of a perfect first date?`);
        setStep("ask_q2");
        break;
      }
      case "ask_q2": {
        setQ2(value);
        setStep("intro");
        await sendBot(`mmmm okay.`);
        await sendBot(
          `last one — 3/3: what’s something a date wouldn’t notice on the first night, but really should know about ${displayName}?`
        );
        setStep("ask_q3");
        break;
      }
      case "ask_q3": {
        const ans = value;
        setQ3(ans);
        setStep("submitting");
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
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          await sendBot(`hmm — couldn’t save that: ${msg}. tap send to try again.`);
          setStep("ask_q3");
        }
        break;
      }
      default:
        break;
    }
  }

  const placeholder = "iMessage";
  const disabled = typing || step === "submitting" || step === "done" || step === "intro";

  // Compute which bubbles get the iOS "tail" — only the last one in a
  // consecutive streak from the same side (matches iOS behavior).
  const tailMap = useMemo(() => {
    const m = new Set<string>();
    for (let i = 0; i < bubbles.length; i++) {
      const next = bubbles[i + 1];
      if (!next || next.from !== bubbles[i].from) m.add(bubbles[i].key);
    }
    // Typing replaces the trailing tail on the incoming side.
    if (typing) {
      for (let i = bubbles.length - 1; i >= 0; i--) {
        if (bubbles[i].from === "vouch") {
          m.delete(bubbles[i].key);
          break;
        }
      }
    }
    return m;
  }, [bubbles, typing]);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
    []
  );

  return (
    <div className="phone-edge-to-edge imsg-shell">
      <header className="imsg-header">
        <a href="/" className="imsg-back" aria-label="Back">
          <svg viewBox="0 0 12 20" fill="none">
            <path
              d="M10 1L2 10l8 9"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Messages</span>
        </a>

        <div className="imsg-contact">
          <div className="imsg-avatar">
            {avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" />
            )}
          </div>
          <span className="imsg-contact-name">
            vouch
            <svg viewBox="0 0 7 12" fill="none">
              <path
                d="M1 1l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        <button className="imsg-info" type="button" aria-label="Info" tabIndex={-1}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.4" />
            <path
              d="M10 9v5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <circle cx="10" cy="6.4" r="0.9" fill="currentColor" />
          </svg>
        </button>
      </header>

      <div ref={scrollRef} className="imsg-thread">
        <div className="imsg-date">
          <span>
            <strong>iMessage</strong>
          </span>
          <span>Today {todayLabel}</span>
        </div>

        {bubbles.map((b) => (
          <div
            key={b.key}
            className={"imsg-row " + (b.from === "vouch" ? "imsg-row--in" : "imsg-row--out")}
          >
            <div
              className={
                "imsg-bubble " + (b.from === "vouch" ? "imsg-bubble--in" : "imsg-bubble--out")
              }
              data-tail={tailMap.has(b.key) ? "true" : "false"}
            >
              {b.text}
            </div>
          </div>
        ))}

        {typing && (
          <div className="imsg-row imsg-row--in">
            <div className="imsg-bubble imsg-bubble--in" data-tail="true">
              <span className="imsg-typing">
                <span />
                <span />
                <span />
              </span>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="imsg-status">Delivered</div>
        )}
      </div>

      <div className="imsg-composer">
        <div className="imsg-composer-row">
          <button className="imsg-plus" type="button" tabIndex={-1} aria-hidden>
            +
          </button>
          <div className="imsg-input-wrap">
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
              className="imsg-input"
              autoFocus
            />
            {input.trim() ? (
              <button
                onClick={onSend}
                disabled={disabled || !input.trim()}
                aria-label="Send"
                className="imsg-send"
              >
                <svg viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 14V2M8 2L3 7M8 2l5 5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : (
              <button className="imsg-mic" type="button" tabIndex={-1} aria-label="Voice">
                <svg viewBox="0 0 14 18" fill="none">
                  <rect x="4" y="1" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.4" />
                  <path
                    d="M2 9a5 5 0 0 0 10 0M7 14v3M4.5 17h5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
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
