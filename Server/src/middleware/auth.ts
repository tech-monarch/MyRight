import type { NextFunction, Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { prisma } from "@/infrastructure/database/prisma";
import { hashToken } from "@/utils/session-token";
import { AppError } from "@/utils/AppError";
import { asyncHandler } from "@/utils/asyncHandler";
import { env } from "@/config/env";

export type AuthRequest = Request;

/**
 * Reads the session cookie, looks up the (hashed) token, and attaches the
 * authenticated user to the request. This is the single place session
 * validity is decided, every other check (role, courthouse, ownership)
 * happens after this and can assume req.user is trustworthy.
 */
export const requireAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.[env.SESSION_COOKIE_NAME];
    if (!token) throw AppError.unauthorized();

    const session = await prisma.session.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw AppError.unauthorized(
        "Your session has expired. Please log in again.",
      );
    }

    if (session.user.status !== "ACTIVE") {
      throw AppError.forbidden("This account is no longer active.");
    }

    req.user = {
      id: session.user.id,
      role: session.user.role,
      status: session.user.status,
      name: session.user.name,
      courthouseId: session.user.courthouseId,
      mustChangePassword: session.user.mustChangePassword,
    };
    next();
  },
);

/**
 * Role checks are a curried middleware factory (requireRole(...roles))
 * rather than scattered `if (user.role === ...)` checks in every route,
 * per the "centralized authorization" requirement: the policy lives in
 * one place and reads the same way everywhere it's used.
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(AppError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden());
    }
    next();
  };
}
