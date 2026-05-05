import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Server-side signup for the inline onboarding flow.
// Uses the service-role admin API to create the user with
// email already flagged as confirmed, so the user can complete
// photos + basics + reach the dashboard without ever leaving the
// session for an email-verification round-trip. (We can prompt
// them to confirm after onboarding if we ever want to.)
//
// Returning users (already registered) get a 409 — the client
// then falls through to a regular signInWithPassword.
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      const msg = error.message || "Signup failed";
      const exists =
        /already.*registered|already.*exists|duplicate|email.*registered|user.*exists/i.test(
          msg
        );
      return NextResponse.json(
        { error: msg, alreadyExists: exists },
        { status: exists ? 409 : 400 }
      );
    }

    return NextResponse.json({ ok: true, userId: data.user?.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Signup failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
