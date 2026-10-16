/**
 * WhatsApp needs international digits. Nigerian numbers are usually typed
 * locally (07012345678), which must become 2347012345678. Anything that
 * already carries a country code (+234..., 234...) just has symbols stripped.
 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
}

/** 10-15 digits once normalized (the E.164 range). Not a guarantee the number exists. */
export function isPlausiblePhone(raw: string): boolean {
  const n = normalizePhone(raw);
  return n.length >= 10 && n.length <= 15;
}
