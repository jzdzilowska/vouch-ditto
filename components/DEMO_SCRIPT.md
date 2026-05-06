# Vouch — Demo Walkthrough

**Runtime:** 5 minutes, screen shared, live app
**Voice:** You know this industry. You built this. Explain it like you're walking someone through your work — clear, grounded, no performance.

---

## Setup

- `localhost:3000` open in phone frame
- Logged into a test account with 3 friend submissions, status `pending_review`
- Second account with a `live` profile in Discover
- `/friend/{slug}` open in a separate tab

---

## Landing (~60s)

> *Black background, drifting orbs in amber and rose, film grain, heading: "Let yourself be seen for who you are."*

"Vouch is a dating app where your profile is written by the people who know you — your close friends — instead of by you.

The idea came from something I kept noticing. When someone sits down to write a dating bio, one of two things happens: they undersell themselves — downplay what's interesting about them because they're self-conscious or don't want to seem like they're trying too hard — or they oversell, because there's this pressure to package yourself into something more appealing than you think you are. Either way, the profile rarely reflects who that person actually is.

And this isn't a small problem in a niche market. Online dating did $6 billion in revenue in 2025, with over 350 million users worldwide. But the growth is stalling — installs and sessions declined in both 2024 and 2025. Tinder posted its first-ever revenue decline. Bumble's paying users dropped 16%. A Forbes survey found 79% of Gen Z users report burnout, with the top reason being the inability to form a real connection. The market is huge but the incumbents are losing trust, and a lot of that traces back to the profile — people feel reduced to a photo and a few lines of copy that sound like everyone else's.

What struck me was how different it sounds when someone else describes you. A friend introducing you at dinner is always more specific, more honest, and more interesting than anything you'd write about yourself. That's where Vouch comes from — remove self-description entirely and let the people who know you speak for you.

The visual direction is part of that positioning. Every major dating app converges on the same look — bright gradients, saturated colors, rounded everything. It's designed to feel gamified and disposable. Vouch is the opposite: black palette, warm cream text, film grain, slow-moving elements. It's meant to signal that this experience takes you more seriously."

---

## Signup (~30s)

> *Click through all four steps — they cross-fade on the same page.*

"Onboarding is four steps on a single page — no route changes, just cross-fades. The first version was multi-page, and I saw drop-off between transitions. Dating apps see day-one retention around 26%, so every unnecessary page load is a real risk. Collapsing it into a single-page state machine removed those exit points.

The framework is Next.js 14 on the App Router — chosen because this app serves two different user types from one codebase: authenticated users and unauthenticated friends arriving via public links. App Router lets me colocate both with shared layouts but separate auth logic, with API routes alongside the pages.

Photos: minimum three, max six, first one becomes the hero. No filters, no cropping — if the brand is authenticity, the product shouldn't offer tools to undermine it. Basics: name, age, city, gender, preference. No bio field. No personality prompts. Your friends handle that."

---

## Dashboard (~30s)

> *Three vouch slots, share section at bottom.*

"The dashboard tracks three vouch slots. The critical design problem here is the share mechanism — the entire product depends on a friend actually opening a link and finishing a conversation.

The first version used email invites. Completion was poor — email felt transactional, not personal. Switching to iMessage changed the conversion significantly. The primary button uses the `sms:` URI scheme — opens a native compose with the link pre-filled. The friend receives it in a text thread, which frames it as a personal ask, not a product notification.

The friend route is fully public — no auth required. I tested even minimal friction, like asking for an email first, and it killed completion immediately. The profile slug provides a URL-safe lookup without exposing user IDs."

---

## Friend Chat (~60s)

> *Switch tab. iMessage-styled chat with typing indicators.*

"This is what the friend sees, and it's the most consequential design decision in the app.

It replicates iMessage — same bubbles, same colors, same typing indicators. That's not cosmetic. I prototyped three versions: a web form, a branded chat, and this. The difference in response quality was clear. The form produced short, guarded answers — people wrote like they were filling out a reference check. The iMessage interface changed the behavior entirely. Answers got longer, more natural, more specific. People wrote as though they were texting a friend, because the interface told them that's what they were doing. That tonal difference in the input is what determines whether the synthesized bio sounds like a person or a template.

The bot asks three questions, each chosen for a specific function in the synthesis. 'Describe them in three words' gives Claude the adjectives — the bio's scaffolding. 'Their ideal Sunday' forces specificity — it's hard to be generic narrating a sequence of events. 'Something a date wouldn't notice but should' surfaces the detail only a close friend would know. The question count was iterated from five down to three — five caused abandonment, two didn't give Claude enough signal.

Validation is Zod at the API layer. Row Level Security on submissions: anyone can insert, only the profile owner can read."

---

## Review + Synthesis (~50s)

> *Hero card, expandable vouches, bio textarea.*

"The user reviews what friends said and generates a bio. Each submission is expandable — every answer visible, unedited."

**CLICK: "Generate from vouches"**

> *"Generating…" → bio appears.*

"This is the Claude integration — the core of the product. The API route pulls all submissions, structures them into a prompt, and sends it to Sonnet. The prompt specifies 80 to 130 words, third person, warm but understated, and the key instruction is to synthesize across friends — not list what each one said.

I tested Claude and GPT-4 side by side with identical inputs. Claude produced more cohesive output — it wove details from multiple friends into a single voice instead of producing a segmented summary. It required fewer regenerations and the prompting was more straightforward.

Sonnet for latency — about two seconds. The model is a single constant; switching is one line. Every draft is stored with source submission IDs and model version — full audit trail."

**CLICK: "Approve & go live"**

"Regenerate, edit, or approve. One action and the profile is live."

---

## Discover (~40s)

> *Full-bleed card: photo, name, friend quote, pass/vouch back.*

"The discover deck is where the thesis becomes visible. Every card shows a photo, name, and — prominently — a quote from a friend, attributed. Not self-authored copy. A vouch from someone who knows them. You can page through multiple friend quotes per card.

The action isn't 'like' — it's 'vouch back.' That vocabulary is deliberate. 'Like' is passive. 'Vouch' carries weight.

Swipe animations are Framer Motion — chosen for its native gesture physics. Match creation is a Postgres trigger, not application code. When a swipe inserts, the trigger checks for a reciprocal row and creates the match atomically in the same transaction — eliminating the race condition you get when match detection runs in the API layer.

That principle runs through the codebase: API routes are thin — validate with Zod, call Supabase, return. Business logic lives where it has transactional guarantees. External services sit behind provider interfaces — SMS has mock and Twilio implementations, toggled by environment variable."

---

## Close (~30s)

"This is a $6 billion market that's contracting in engagement. Users are burned out, and the core complaint is that profiles don't reflect real people. Vouch addresses that at the source — instead of asking someone to represent themselves, which consistently produces either understatement or overstatement, it removes self-authorship and replaces it with the perspective of people who actually know them.

Every tool choice maps to a specific problem. Next.js for two audience types in one codebase. Supabase for consolidating auth, database, storage, and RLS under one SDK. Claude for tone-controlled synthesis. Framer for gesture physics. Zod for validation at every trust boundary. The architecture assumes change — provider interfaces, model constants, thin handlers, logic in the right layer.

Research to concept, concept to design, design to code, and back to research when something didn't hold. That's how this was built."

---

## Total: ~5:00

---

## Anticipated Questions

**"What's the market opportunity?"**
"$6 billion in 2025, but installs and sessions declined two years running. Tinder's first-ever revenue decline. Bumble's paying users down 16%. 79% of Gen Z report burnout. The dissatisfaction is structural — no one's addressing the profile problem at the root."

**"What research informed this?"**
"Conversations with people who'd recently left dating apps — the profile was consistently the pain point. I also tested the friend flow in three formats and iterated the question set from five to three based on completion data and synthesis quality."

**"How did the product evolve?"**
"Four major changes: single-page signup after observing page-transition drop-off, iMessage invites after poor email completion, three questions after five caused abandonment, and a SQL trigger for matching after identifying a race condition. Each was a response to observation."

**"Why Claude?"**
"Tone. Tested against GPT-4 with identical inputs — Claude produced more cohesive output, required fewer regenerations. Sonnet for latency. Model is a single constant."

**"Code architecture?"**
"Thin API routes, Zod validation, business logic in the database as triggers, external services behind provider interfaces. Everything runs locally, everything is testable in isolation."

**"Why Supabase?"**
"Needed auth, relational data, storage, and RLS together. Firebase is document-oriented — RLS would mean custom Cloud Functions. Supabase gave me Postgres with native RLS, auth, and storage through one SDK."

**"Why iMessage?"**
"The framing changes how people write. Form answers were short and guarded. iMessage answers were longer, more natural, more specific. That quality difference is what makes the synthesis sound human."

**"What's next?"**
"Messaging on match, content moderation via Anthropic's classification API, push notifications on friend submissions, email verification. Architecture was built with all of it in mind."
