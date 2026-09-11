import { createHmac, timingSafeEqual } from "crypto";
import { google } from "googleapis";
import { env } from "@/config/env";
import { prisma } from "@/infrastructure/database/prisma";
import { encrypt, decrypt } from "@/utils/encryption";
import { AppError } from "@/utils/AppError";

/**
 * The OAuth callback is a top-level navigation *from* accounts.google.com
 * *to* our server, our session cookie is sameSite=strict specifically to
 * block cross-site requests, which means it does not survive this
 * redirect and requireAuth cannot be used on the callback route. This
 * signs the lawyer's id into the `state` param instead (Google just
 * echoes it back unmodified), so the callback can trust it without a
 * session, forging a valid one requires knowing ENCRYPTION_KEY.
 */
export function signState(userId: string): string {
  const signature = createHmac("sha256", env.ENCRYPTION_KEY ?? "").update(userId).digest("hex");
  return `${userId}.${signature}`;
}

export function verifyState(state: string): string | null {
  const [userId, signature] = state.split(".");
  if (!userId || !signature) return null;
  const expected = createHmac("sha256", env.ENCRYPTION_KEY ?? "").update(userId).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return userId;
}

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
];

function assertConfigured() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REDIRECT_URI) {
    throw new AppError(
      503,
      "GOOGLE_NOT_CONFIGURED",
      "Google Meet scheduling is not configured on this server yet."
    );
  }
}

function newOAuthClient() {
  assertConfigured();
  return new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI);
}

/**
 * `state` carries the lawyer's user id through the redirect so the
 * callback knows whose account to attach the tokens to, signed
 * implicitly by being a session-authenticated request on the way in
 * (see mediation.routes.ts), Google just echoes it back unmodified.
 */
export function getGoogleAuthUrl(state: string): string {
  const client = newOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline", // required to receive a refresh token
    prompt: "consent", // forces a refresh token on every connect, not just the first
    scope: SCOPES,
    state,
  });
}

export async function connectGoogleAccount(userId: string, code: string): Promise<{ email: string }> {
  const client = newOAuthClient();
  const { tokens } = await client.getToken(code);
  if (!tokens.refresh_token) {
    throw AppError.badRequest(
      "Google did not return a refresh token. Please try connecting again and make sure to approve offline access."
    );
  }

  client.setCredentials(tokens);
  const oauth2 = google.oauth2({ auth: client, version: "v2" });
  const { data: profile } = await oauth2.userinfo.get();
  if (!profile.email) throw AppError.badRequest("Could not read the connected Google account's email.");

  await prisma.googleAccountConnection.upsert({
    where: { userId },
    create: {
      userId,
      googleEmail: profile.email,
      encryptedRefreshToken: encrypt(tokens.refresh_token),
      scope: tokens.scope ?? SCOPES.join(" "),
    },
    update: {
      googleEmail: profile.email,
      encryptedRefreshToken: encrypt(tokens.refresh_token),
      scope: tokens.scope ?? SCOPES.join(" "),
    },
  });

  return { email: profile.email };
}

export async function disconnectGoogleAccount(userId: string): Promise<void> {
  await prisma.googleAccountConnection.deleteMany({ where: { userId } });
}

export async function getGoogleConnectionStatus(userId: string) {
  const connection = await prisma.googleAccountConnection.findUnique({ where: { userId } });
  return connection ? { connected: true, email: connection.googleEmail } : { connected: false, email: null };
}

/** An authenticated OAuth2 client for a lawyer who has connected their Google account, or null if they haven't. */
export async function getAuthorizedClientForLawyer(lawyerId: string) {
  const connection = await prisma.googleAccountConnection.findUnique({ where: { userId: lawyerId } });
  if (!connection) return null;

  const client = newOAuthClient();
  client.setCredentials({ refresh_token: decrypt(connection.encryptedRefreshToken) });
  return client;
}
