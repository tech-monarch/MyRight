import type { NextFunction, Request, Response } from "express";
import { randomBytes } from "crypto";
import { AppError } from "@/utils/AppError";
import { env, isProduction } from "@/config/env";

/**
 * Double-submit cookie CSRF protection.
 *
 * In development the session cookie is sameSite=lax, which already blocks
 * most cross-site request forgery on its own, this double-submit check is
 * a second layer. In production it's sameSite=none (required for a
 * frontend and backend on different domains, see cookies.ts), which
 * provides no CSRF protection at all, so this check is the *only* CSRF
 * defense there, not a backup one. It still holds up on its own: a
 * cross-site attacker's forged request carries the browser's cookies
 * automatically, but same-origin policy stops their page's JavaScript
 * from reading the CSRF cookie's value to put in the required header.
 */
const sameSitePolicy = isProduction ? "none" : "lax";

export function issueCsrfCookie(res: Response): string {
  const token = randomBytes(24).toString("hex");
  res.cookie(env.CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: isProduction,
    sameSite: sameSitePolicy,
    path: "/",
  });
  return token;
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function requireCsrf(req: Request, _res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method)) return next();

  const cookieToken = req.cookies?.[env.CSRF_COOKIE_NAME];
  const headerToken = req.header("x-csrf-token");

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(AppError.forbidden("Missing or invalid CSRF token"));
  }
  next();
}
