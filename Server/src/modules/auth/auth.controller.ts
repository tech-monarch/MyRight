import type { Request, Response } from "express";
import * as authService from "@/modules/auth/auth.service";
import { setSessionCookie, clearSessionCookie } from "@/modules/auth/cookies";
import { issueCsrfCookie } from "@/middleware/csrf";
import { writeAuditLog } from "@/utils/audit-log";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/AppError";
import { env } from "@/config/env";
import { prisma } from "@/infrastructure/database/prisma";

async function startSession(req: Request, res: Response, userId: string) {
  const { token, expiresAt } = await authService.createSession(userId, {
    userAgent: req.header("user-agent") ?? undefined,
    ipAddress: req.ip,
  });
  setSessionCookie(req, res, token, expiresAt);
  issueCsrfCookie(req, res);
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.registerDisputant(req.body);
  await startSession(req, res, user.id);
  await writeAuditLog({
    actorId: user.id,
    actorLabel: user.name,
    action: "USER_REGISTERED",
    targetType: "User",
    targetId: user.id,
    result: "SUCCESS",
  });
  res.status(201).json({ success: true, data: authService.toPublicUser(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  try {
    const user = await authService.authenticate(identifier, password);
    await startSession(req, res, user.id);
    await writeAuditLog({
      actorId: user.id,
      actorLabel: user.name,
      action: "LOGIN",
      targetType: "User",
      targetId: user.id,
      result: "SUCCESS",
    });
    res.json({ success: true, data: authService.toPublicUser(user) });
  } catch (err) {
    await writeAuditLog({
      actorLabel: identifier,
      action: "LOGIN",
      targetType: "User",
      result: "DENIED",
    });
    throw err;
  }
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[env.SESSION_COOKIE_NAME];
  if (token) await authService.destroySession(token);
  clearSessionCookie(res);
  res.json({ success: true, data: null });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user.id } });
  res.json({ success: true, data: authService.toPublicUser(user) });
});

/**
 * Issues the CSRF cookie and, critically, returns the same token value in
 * the response body. A frontend on a different domain than this API
 * cannot read the cookie itself via document.cookie (cross-origin
 * cookies are invisible to JS regardless of httpOnly), so it has no other
 * way to learn the value it needs to echo back in the x-csrf-token
 * header. The cookie the browser attaches automatically and the value
 * returned here are the same token, that's what makes the double-submit
 * check work: an attacker's page can trigger the cookie being sent, but
 * can't call this endpoint cross-origin and read its response (CORS
 * blocks that) to get a matching header value.
 */
export const getCsrfToken = asyncHandler(async (req: Request, res: Response) => {
  const token = issueCsrfCookie(req, res);
  res.json({ success: true, data: { csrfToken: token } });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized();
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);
  await writeAuditLog({
    actorId: req.user.id,
    actorLabel: req.user.name,
    action: "PASSWORD_CHANGED",
    targetType: "User",
    targetId: req.user.id,
    result: "SUCCESS",
  });
  // All sessions were invalidated by the password change, including this
  // one, so the client must log in again with the new password.
  clearSessionCookie(res);
  res.json({ success: true, data: null });
});
