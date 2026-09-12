import type { Response } from "express";
import { env, isProduction } from "@/config/env";

/**
 * SameSite=Strict only works when the frontend and backend share the same
 * "site" (same registrable domain, e.g. both on localhost regardless of
 * port). A real deployment typically has them on genuinely different
 * domains (a Vercel frontend, a Render backend), which makes every
 * request cross-site, and Strict silently blocks the cookie from ever
 * being sent back, even on an ordinary authenticated fetch(). SameSite=None
 * is required for that to work, and browsers require Secure (HTTPS-only)
 * alongside None, hence the production/development split rather than a
 * single hardcoded value.
 */
const sameSitePolicy = isProduction ? "none" : "lax";

export function setSessionCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: sameSitePolicy,
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(env.SESSION_COOKIE_NAME, { path: "/" });
  res.clearCookie(env.CSRF_COOKIE_NAME, { path: "/" });
}
