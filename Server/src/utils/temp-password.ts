import { randomInt } from "crypto";

// Excludes visually ambiguous characters (0/O, 1/l/I) since this is
// usually read aloud or typed from a screen by whoever is handing it to
// the new lawyer.
const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

export function generateTempPassword(length = 12): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CHARS[randomInt(0, CHARS.length)];
  }
  return out;
}
