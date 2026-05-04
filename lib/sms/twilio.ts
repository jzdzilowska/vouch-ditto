import type { SmsProvider, OutboundSms, SmsSendResult } from "./types";

// Stubbed Twilio provider — wire when you have an account.
// Uses fetch instead of the SDK to keep dependencies light.
export class TwilioSmsProvider implements SmsProvider {
  readonly name = "twilio";

  async send(msg: OutboundSms): Promise<SmsSendResult> {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER;
    if (!sid || !token || !from) {
      return { id: "no-config", provider: "twilio", to: msg.to, body: msg.body, status: "failed", error: "Twilio env vars missing" };
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const form = new URLSearchParams({ To: msg.to, From: from, Body: msg.body });

    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    const json = (await res.json()) as { sid?: string; status?: string; message?: string };
    if (!res.ok) {
      return { id: "err", provider: "twilio", to: msg.to, body: msg.body, status: "failed", error: json.message ?? `HTTP ${res.status}` };
    }
    return { id: json.sid ?? "unknown", provider: "twilio", to: msg.to, body: msg.body, status: "sent" };
  }
}
