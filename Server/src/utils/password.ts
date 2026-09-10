import bcrypt from "bcrypt";

// Cost factor 12 is a deliberate choice: high enough to be slow for an
// attacker doing offline cracking, low enough not to noticeably slow down
// login on ordinary hardware. Revisit upward as hardware improves.
const SALT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
