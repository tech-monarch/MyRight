import type { NextFunction, Request, Response } from "express";
import { randomBytes } from "crypto";
import { AppError } from "@/utils/AppError";
import { env } from "@/config/env";

/**
 * Double-submit cookie CSRF protection.
 *
 * When the request arrives over plain HTTP (local dev, same-site
 * localhost), the session cookie is sameSite=lax, which already blocks
 * most cross-site request forgery on its own, this double-submit check
 * is a second layer. Over HTTPS in a real deployment it's
 * sameSite=none (required whenever the frontend and backend are on
 * different domains, see cookies.ts), which provides no CSRF protection
 * at all, so this check is the *only* CSRF defense there, not a backup
 * one. It still holds up on its own: a cross-site attacker's forged
 * request carries the browser's cookies automatically, but same-origin
 * policy stops their page's JavaScript from reading the CSRF cookie's
 * value to put in the required header.
 */
export function issueCsrfCookie(req: Request, res: Response): string {
  const token = randomBytes(24).toString("hex");
  const secure = req.secure;
  res.cookie(env.CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure,
    sameSite: secure ? "none" : "lax",
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
