import Link from "next/link";
import GrainOverlay from "@/components/GrainOverlay";

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="gradient-bg" />
      <GrainOverlay />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="px-6 py-6 flex items-center justify-between max-w-5xl mx-auto w-full">
          <div className="font-display italic text-2xl tracking-tight text-white/90">vouch</div>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm">Log in</Link>
            <Link href="/signup" className="btn-primary text-sm">Get started</Link>
          </nav>
        </header>

        <section className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-2xl text-center">
            <p className="text-typewriter text-white/40 text-xs tracking-[0.25em] uppercase mb-8">
              A different kind of dating app
            </p>

            <h1 className="h-display text-ink mb-6">
              Let your friends{" "}
              <br className="hidden md:block" />
              write your <em className="text-blush">profile.</em>
            </h1>

            <p className="text-typewriter text-white/50 text-sm md:text-base leading-relaxed mb-12 max-w-md mx-auto">
              You upload the photos. Three friends answer three questions
              about you. Our model stitches it into a profile that actually
              sounds like <em className="text-white/70">you</em> — because they know you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup" className="btn-primary">Build my profile</Link>
              <a href="#how" className="btn-ghost text-white/50 hover:text-white/80">
                How it works ↓
              </a>
            </div>
          </div>
        </section>

        <section id="how" className="px-6 pb-24 pt-16 max-w-5xl mx-auto w-full">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { n: "01", t: "Sign up", b: "Add your photos and a few basics. Takes a minute." },
              { n: "02", t: "Send a link", b: "Text the invite to 2–3 friends. They answer 3 questions." },
              { n: "03", t: "Approve & go live", b: "Edit the AI-stitched profile, then you're discoverable." },
            ].map((s) => (
              <div key={s.n} className="card p-6">
                <div className="text-typewriter text-accent2 text-xs tracking-widest mb-4">{s.n}</div>
                <div className="font-display italic text-xl text-ink mb-2">{s.t}</div>
                <p className="text-typewriter text-white/40 text-sm">{s.b}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="px-6 py-8 text-center">
          <p className="text-typewriter text-white/20 text-xs tracking-widest">
            vouch · built as a demo
          </p>
        </footer>
      </div>
    </main>
  );
}
