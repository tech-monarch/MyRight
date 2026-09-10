import { prisma } from "@/infrastructure/database/prisma";
import { hashPassword, verifyPassword } from "@/utils/password";
import { generateSessionToken, hashToken } from "@/utils/session-token";
import { AppError } from "@/utils/AppError";
import { env } from "@/config/env";
import type { User } from "@prisma/client";

const SESSION_TTL_MS = env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

export async function registerDisputant(input: { name: string; email: string; password: string }) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    // Intentionally vague: confirming "this email is already registered"
    // to an anonymous caller is a minor account enumeration leak. A real
    // product would instead send a "someone tried to register with your
    // email" notice, kept as a documented simplification for now.
    throw AppError.conflict("Could not create an account with those details.");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      role: "DISPUTANT",
      name: input.name,
      email: input.email,
      passwordHash,
    },
  });

  return user;
}

export async function authenticate(identifier: string, password: string): Promise<User> {
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
  });

  // Same error for "no such user" and "wrong password" so a caller cannot
  // use the login endpoint to discover which identifiers are registered.
  const invalidCredentials = () => AppError.unauthorized("Incorrect email/username or password.");

  if (!user) throw invalidCredentials();

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw invalidCredentials();

  if (user.status !== "ACTIVE") {
    throw AppError.forbidden("This account is not active. Contact your SuperAdmin.");
  }

  return user;
}

export async function createSession(
  userId: string,
  meta: { userAgent?: string; ipAddress?: string }
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function destroySession(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) throw AppError.badRequest("Your current password is incorrect.");

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, mustChangePassword: false },
  });

  // Changing your password invalidates every other session, so a stolen
  // session cookie stops working the moment the real owner notices and
  // changes their password.
  await prisma.session.deleteMany({ where: { userId } });
}

export function toPublicUser(user: User) {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}
