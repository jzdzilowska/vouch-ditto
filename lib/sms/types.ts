// Provider-agnostic SMS interface. Swap MockSmsProvider for TwilioSmsProvider
// when ready (or LiveSmsProvider for any other vendor).
export type OutboundSms = {
  to: string;            // E.164 phone, or anything for mock
  body: string;
  meta?: Record<string, unknown>;
};

export type SmsSendResult = {
  id: string;
  provider: string;
  to: string;
  body: string;
  status: "queued" | "sent" | "failed";
  error?: string;
};

export interface SmsProvider {
  readonly name: string;
  send(msg: OutboundSms): Promise<SmsSendResult>;
}
