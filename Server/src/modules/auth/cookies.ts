import type { Request, Response } from "express";
import { env } from "@/config/env";

/**
 * The cookie policy is derived from whether *this specific request*
 * arrived over HTTPS (req.secure, reliable now that app.ts sets
 * `trust proxy`, which makes Express read the real protocol from
 * X-Forwarded-Proto behind Render/any reverse proxy), rather than from
 * NODE_ENV. This makes it self-correcting: a misconfigured or missing
 * NODE_ENV can no longer silently reintroduce the "cookie set but never
 * sent back" bug this was written to fix, the policy always matches
 * reality instead of a static assumption about the environment.
 *
 * SameSite=Strict only works when the frontend and backend share the
 * same "site" (same registrable domain, e.g. both on localhost
 * regardless of port). A real deployment typically has them on
 * genuinely different domains (a Vercel frontend, a Render backend),
 * which makes every request cross-site, and Strict silently blocks the
 * cookie from ever being sent back, even on an ordinary authenticated
 * fetch(). SameSite=None is required for that to work, and browsers
 * require Secure (HTTPS-only) alongside None, hence deriving both
 * together from the same signal.
 */
function cookiePolicy(req: Request): { secure: boolean; sameSite: "none" | "lax" } {
  const secure = req.secure;
  return { secure, sameSite: secure ? "none" : "lax" };
}

export function setSessionCookie(req: Request, res: Response, token: string, expiresAt: Date) {
  const { secure, sameSite } = cookiePolicy(req);
  res.cookie(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(env.SESSION_COOKIE_NAME, { path: "/" });
  res.clearCookie(env.CSRF_COOKIE_NAME, { path: "/" });
}
