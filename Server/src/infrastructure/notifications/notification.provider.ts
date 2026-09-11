/**
 * A channel-agnostic interface so notification.service.ts (the thing
 * every feature actually calls) doesn't need to know whether a message
 * goes out over WhatsApp, email, or something added later. Only
 * WhatsApp is implemented today, per the "create an abstraction rather
 * than tightly coupling to one provider" requirement, adding email later
 * is a new file implementing this, not a rewrite of every call site.
 */
export interface NotificationResult {
  sent: boolean;
  error?: string;
}

export interface NotificationProvider {
  /** `to` is a phone number in international format without symbols, e.g. "2348030001111". */
  sendMessage(to: string, message: string): Promise<NotificationResult>;
  isReady(): boolean;
}
