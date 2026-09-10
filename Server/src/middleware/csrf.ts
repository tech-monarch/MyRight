import type { NextFunction, Request, Response } from "express";
import { randomBytes } from "crypto";
import { AppError } from "@/utils/AppError";
import { env, isProduction } from "@/config/env";

/**
 * Double-submit cookie CSRF protection.
 *
 * The session cookie is httpOnly and sameSite=strict, which already blocks
 * most cross-site request forgery on its own. This adds a second, readable
 * cookie whose value the frontend must echo back in a custom header on
 * every mutating request. A cross-site attacker can trigger a cookie-bearing
 * request but cannot read the CSRF cookie's value to put it in that header
 * (same-origin policy), so the two layers cover each other's gaps rather
 * than duplicating the same protection.
 */
export function issueCsrfCookie(res: Response): string {
  const token = randomBytes(24).toString("hex");
  res.cookie(env.CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: isProduction,
    sameSite: "strict",
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
