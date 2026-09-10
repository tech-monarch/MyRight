import type { Response } from "express";
import { env, isProduction } from "@/config/env";

export function setSessionCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(env.SESSION_COOKIE_NAME, { path: "/" });
  res.clearCookie(env.CSRF_COOKIE_NAME, { path: "/" });
}
