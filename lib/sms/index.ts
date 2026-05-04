import { MockSmsProvider } from "./mock";
import { TwilioSmsProvider } from "./twilio";
import type { SmsProvider } from "./types";

let _provider: SmsProvider | null = null;

export function smsProvider(): SmsProvider {
  if (_provider) return _provider;
  const which = (process.env.SMS_PROVIDER ?? "mock").toLowerCase();
  _provider = which === "twilio" ? new TwilioSmsProvider() : new MockSmsProvider();
  return _provider;
}

export type { SmsProvider, OutboundSms, SmsSendResult } from "./types";
