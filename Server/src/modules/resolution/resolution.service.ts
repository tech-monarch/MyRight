import { randomBytes } from "crypto";
import { prisma } from "@/infrastructure/database/prisma";
import { hashToken } from "@/utils/session-token";
import { AppError } from "@/utils/AppError";
import { env } from "@/config/env";
import { transitionStatus } from "@/modules/disputes/disputes.service";
import { notifySigningRequest, notifyResolutionFullySigned } from "@/infrastructure/notifications/notification.service";

const SIGNING_TOKEN_TTL_DAYS = 21;

export function getLatestResolution(disputeId: string) {
  return prisma.resolution.findFirst({
    where: { disputeId },
    orderBy: { createdAt: "desc" },
    include: { signatures: true },
  });
}

export async function createResolution(input: { disputeId: string; createdById: string; terms: string }) {
  const dispute = await prisma.dispute.findUniqueOrThrow({ where: { id: input.disputeId } });

  const resolution = await prisma.resolution.create({
    data: { disputeId: input.disputeId, createdById: input.createdById, terms: input.terms },
  });

  // A fresh single-use link every time a resolution is created, rather
  // than one long-lived link per dispute, so an old link shared
  // (accidentally or otherwise) stops being useful once a new draft of
  // the terms exists.
  const rawToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SIGNING_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.resolutionSigningToken.create({
    data: { resolutionId: resolution.id, tokenHash: hashToken(rawToken), expiresAt },
  });

  const signingUrl = `${env.APP_URL}/sign/${rawToken}`;

  if (dispute.otherPartyContact && !dispute.otherPartyContact.includes("@")) {
    await notifySigningRequest({
      phone: dispute.otherPartyContact,
      disputeTitle: dispute.title,
      signingUrl,
    });
  }

  return { resolution, signingUrl };
}

async function finalizeIfFullySigned(resolutionId: string, disputeId: string) {
  const signatures = await prisma.resolutionSignature.findMany({ where: { resolutionId } });
  const hasDisputant = signatures.some((s) => s.party === "DISPUTANT");
  const hasOtherParty = signatures.some((s) => s.party === "OTHER_PARTY");
  if (!hasDisputant || !hasOtherParty) return;

  const dispute = await prisma.dispute.findUniqueOrThrow({ where: { id: disputeId } });

  await prisma.resolution.update({ where: { id: resolutionId }, data: { status: "FULLY_SIGNED" } });
  await transitionStatus(disputeId, dispute.status, "RESOLVED", dispute.ownerId, "Both parties signed the resolution").catch(
    () => undefined
  );

  const owner = await prisma.user.findUnique({ where: { id: dispute.ownerId }, select: { phone: true } });
  await notifyResolutionFullySigned({ userId: dispute.ownerId, phone: owner?.phone, disputeTitle: dispute.title });
  if (dispute.otherPartyContact && !dispute.otherPartyContact.includes("@")) {
    await notifyResolutionFullySigned({ phone: dispute.otherPartyContact, disputeTitle: dispute.title });
  }
}

export async function signAsDisputant(input: {
  resolutionId: string;
  disputeId: string;
  userId: string;
  signerName: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await prisma.resolutionSignature.create({
      data: {
        resolutionId: input.resolutionId,
        party: "DISPUTANT",
        userId: input.userId,
        signerName: input.signerName,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  } catch {
    throw AppError.conflict("You have already signed this resolution.");
  }

  await finalizeIfFullySigned(input.resolutionId, input.disputeId);
}

export async function getResolutionByToken(rawToken: string) {
  const tokenRow = await prisma.resolutionSigningToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { resolution: { include: { dispute: true, signatures: true } } },
  });
  if (!tokenRow || tokenRow.expiresAt < new Date()) {
    throw AppError.notFound("This signing link is invalid or has expired.");
  }
  return tokenRow;
}

export async function signWithToken(input: { rawToken: string; signerName: string; ipAddress?: string; userAgent?: string }) {
  const tokenRow = await getResolutionByToken(input.rawToken);

  const alreadySigned = tokenRow.resolution.signatures.some((s) => s.party === "OTHER_PARTY");
  if (alreadySigned) {
    throw AppError.conflict("This resolution has already been signed by the other party.");
  }

  await prisma.resolutionSignature.create({
    data: {
      resolutionId: tokenRow.resolutionId,
      party: "OTHER_PARTY",
      signerName: input.signerName,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });
  await prisma.resolutionSigningToken.update({ where: { id: tokenRow.id }, data: { usedAt: new Date() } });

  await finalizeIfFullySigned(tokenRow.resolutionId, tokenRow.resolution.disputeId);
}
