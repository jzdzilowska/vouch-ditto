import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="font-display text-2xl tracking-tight">vouch</div>
        <nav className="flex items-center gap-2">
          <Link href="/login" className="btn-ghost">Log in</Link>
          <Link href="/signup" className="btn-primary">Get started</Link>
        </nav>
      </header>

      <section className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <p className="text-accent2 text-sm tracking-widest uppercase mb-4">A different kind of dating app</p>
          <h1 className="h-display mb-5">
            Let your friends write your profile.
          </h1>
          <p className="text-muted text-lg leading-relaxed mb-10">
            You upload the photos. Three friends answer three questions about you. Our model stitches it
            into a profile that actually sounds like <em>you</em> — because they know you.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/signup" className="btn-primary">Build my profile</Link>
            <a href="#how" className="btn-ghost">How it works ↓</a>
          </div>
        </div>
      </section>

      <section id="how" className="px-6 pb-24 pt-12 max-w-5xl mx-auto w-full">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { n: "01", t: "Sign up", b: "Add your photos and a few basics. Takes a minute." },
            { n: "02", t: "Send a link", b: "Text the invite to 2–3 friends. They answer 3 questions." },
            { n: "03", t: "Approve & go live", b: "Edit the AI-stitched profile, then you're discoverable." },
          ].map((s) => (
            <div key={s.n} className="card p-6">
              <div className="text-accent2 font-mono text-sm mb-3">{s.n}</div>
              <div className="text-xl font-semibold mb-1">{s.t}</div>
              <p className="text-muted text-sm">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-6 py-6 text-center text-xs text-muted">
        vouch · built as a demo
      </footer>
    </main>
  );
}
