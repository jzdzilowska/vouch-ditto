import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Demo-only "outbox" view. Shows every message the SMS provider would have sent.
// Helpful when running the mock provider locally — you can tail what would
// hit Twilio without paying for a number.
export default async function AdminSmsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/sms");

  const { data: rows } = await supabase
    .from("sms_outbox")
    .select("id, provider, to_number, body, status, error, meta, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main className="min-h-screen px-6 py-8 max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <Link href="/dashboard" className="text-sm text-muted hover:text-ink">‹ Dashboard</Link>
        <span className="text-xs text-muted uppercase tracking-widest">SMS outbox</span>
      </header>

      <h1 className="h-display mb-2">Outbox</h1>
      <p className="text-muted text-sm mb-6">
        Every text the app would send. The mock provider writes here instead of hitting Twilio so
        you can demo the flow without paying for a phone number.
      </p>

      {rows?.length ? (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="text-muted">
                  to <span className="text-ink/80 font-mono">{r.to_number}</span> ·{" "}
                  <span className="font-semibold uppercase tracking-wider">{r.provider}</span>
                </span>
                <time className="text-muted" dateTime={r.created_at}>
                  {new Date(r.created_at).toLocaleString()}
                </time>
              </div>
              <div className="text-[15px] leading-snug">{r.body}</div>
              {r.error && (
                <div className="mt-2 text-xs text-accent">error: {r.error}</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-6 text-center text-muted">
          No messages yet. Send a friend invite from the dashboard to see one land here.
        </div>
      )}
    </main>
  );
}
