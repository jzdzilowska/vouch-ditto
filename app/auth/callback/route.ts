import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Email-confirmation redirect handler for Supabase auth.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(`${url.origin}${next}`);
}
