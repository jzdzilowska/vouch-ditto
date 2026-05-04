// Prompt construction + Anthropic call for the friend-vouches → bio pipeline.
// Kept in lib/ so it can be unit-tested without a Next.js context.

import { anthropic, SYNTHESIS_MODEL } from "@/lib/anthropic";
import type { FriendSubmission, Profile } from "@/lib/supabase/types";

export type SynthesisInput = {
  profile: Pick<Profile, "display_name" | "age" | "city" | "gender" | "looking_for">;
  submissions: Pick<
    FriendSubmission,
    "friend_name" | "friend_relationship" | "q1_three_words" | "q2_perfect_date" | "q3_secret_strength"
  >[];
};

export type SynthesisResult = {
  bio: string;
  model: string;
  input_tokens?: number;
  output_tokens?: number;
};

const SYSTEM = `You write short, warm, dating-app bios in the voice of someone's friends.

Rules — never break:
- 80–130 words. One paragraph. No headers, bullets, or hashtags.
- Third person ("she's", "he's", "they're") referring to the subject by their first name once at most.
- Synthesize across the friends — do not list "Friend A said X" style.
- Pull *specific* details (the actual perfect date, the actual hidden strength). Vague bios are worthless.
- Tone: warm, witty, slightly understated. Sound like a friend bragging at a dinner party, not a marketing brochure.
- No emojis. No clichés ("loves life", "down for anything", "fluent in sarcasm").
- If friends contradict each other, lean into both ("equal parts X and Y").
- Don't fabricate facts not in the source. If a question's answer is thin, just skip it gracefully.

Output ONLY the bio paragraph. Nothing else.`;

function userPrompt({ profile, submissions }: SynthesisInput): string {
  const basics = [
    `Name: ${profile.display_name}`,
    profile.age ? `Age: ${profile.age}` : null,
    profile.city ? `Location: ${profile.city}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const subs = submissions
    .map((s, i) => {
      const who = `${s.friend_name}${s.friend_relationship ? ` (${s.friend_relationship})` : ""}`;
      return `--- VOUCH ${i + 1} (from ${who}) ---
Three words: ${s.q1_three_words}
Perfect first date: ${s.q2_perfect_date}
Hidden strength a date wouldn't notice: ${s.q3_secret_strength}`;
    })
    .join("\n\n");

  return `Write a dating-app bio for the person below using ONLY what their friends submitted.

${basics}

${subs}

Remember: 80–130 words, one paragraph, third person, specific details, no emojis or clichés. Output the bio only.`;
}

export async function synthesizeBio(input: SynthesisInput): Promise<SynthesisResult> {
  if (input.submissions.length === 0) {
    throw new Error("Need at least one friend submission to synthesize.");
  }

  const client = anthropic();
  const resp = await client.messages.create({
    model: SYNTHESIS_MODEL,
    max_tokens: 600,
    temperature: 0.7,
    system: SYSTEM,
    messages: [{ role: "user", content: userPrompt(input) }],
  });

  // Concatenate any text blocks the model returned.
  const bio = resp.content
    .filter((b): b is { type: "text"; text: string } => b.type === "text")
    .map((b) => b.text.trim())
    .join("\n\n")
    .trim();

  if (!bio) throw new Error("Model returned no text.");

  return {
    bio,
    model: SYNTHESIS_MODEL,
    input_tokens: resp.usage?.input_tokens,
    output_tokens: resp.usage?.output_tokens,
  };
}
