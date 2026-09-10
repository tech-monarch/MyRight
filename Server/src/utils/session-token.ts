import { randomBytes, createHash } from "crypto";

/**
 * The raw token is what goes in the cookie and is shown to the browser.
 * Only its SHA-256 hash is ever stored in the database, so a leaked
 * database (or a lucky SQL injection elsewhere) does not hand over usable
 * session tokens, the same reasoning as storing password hashes instead
 * of passwords.
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
