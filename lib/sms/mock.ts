import type { SmsProvider, OutboundSms, SmsSendResult } from "./types";
import { createAdminClient } from "@/lib/supabase/admin";

// Logs to console AND persists to sms_outbox so the demo UI at /admin/sms
// can show what would have gone out. No real network calls.
export class MockSmsProvider implements SmsProvider {
  readonly name = "mock";

  async send(msg: OutboundSms): Promise<SmsSendResult> {
    const id = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Persist for demo visibility. Best-effort — we never let SMS errors break a flow.
    try {
      const admin = createAdminClient();
      await admin.from("sms_outbox").insert({
        provider: "mock",
        to_number: msg.to,
        body: msg.body,
        meta: msg.meta ?? {},
        status: "sent",
      });
    } catch (e) {
      console.warn("[mock-sms] could not persist:", e);
    }

    // eslint-disable-next-line no-console
    console.log(`[mock-sms → ${msg.to}] ${msg.body}`);
    return { id, provider: "mock", to: msg.to, body: msg.body, status: "sent" };
  }
}
