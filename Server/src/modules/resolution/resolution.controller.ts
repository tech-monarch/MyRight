import type { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/AppError";
import { requireParam } from "@/utils/requireParam";
import { writeAuditLog } from "@/utils/audit-log";
import * as disputesService from "@/modules/disputes/disputes.service";
import { canAccessDispute } from "@/modules/disputes/disputes.policy";
import * as resolutionService from "@/modules/resolution/resolution.service";

async function assertDisputeAccess(req: Request) {
  const disputeId = requireParam(req, "disputeId");
  const dispute = await disputesService.getDisputeOr404(disputeId);
  if (!canAccessDispute(req.user!, dispute, dispute.assignment)) throw AppError.notFound("Dispute not found");
  return dispute;
}

export const getResolution = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await assertDisputeAccess(req);
  const resolution = await resolutionService.getLatestResolution(dispute.id);
  res.json({ success: true, data: resolution });
});

export const createResolution = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await assertDisputeAccess(req);
  if (req.user!.role === "DISPUTANT" && dispute.ownerId !== req.user!.id) {
    throw AppError.forbidden("Only the case owner or assigned mediator can propose a resolution.");
  }

  const { resolution, signingUrl } = await resolutionService.createResolution({
    disputeId: dispute.id,
    createdById: req.user!.id,
    terms: req.body.terms,
  });

  await writeAuditLog({
    actorId: req.user!.id,
    actorLabel: req.user!.name,
    action: "RESOLUTION_PROPOSED",
    targetType: "Dispute",
    targetId: dispute.id,
    result: "SUCCESS",
  });

  // signingUrl is returned so the UI can show a "copy link" fallback if
  // WhatsApp delivery fails or the other party's contact wasn't a phone
  // number, it is not a secret beyond the token itself, which is only
  // usable by whoever has this exact link.
  res.status(201).json({ success: true, data: { resolution, signingUrl } });
});

export const signAsDisputant = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await assertDisputeAccess(req);
  if (req.user!.role !== "DISPUTANT" || dispute.ownerId !== req.user!.id) {
    throw AppError.forbidden("Only the case owner can sign as the disputant.");
  }

  const resolution = await resolutionService.getLatestResolution(dispute.id);
  if (!resolution) throw AppError.notFound("No resolution to sign yet.");

  await resolutionService.signAsDisputant({
    resolutionId: resolution.id,
    disputeId: dispute.id,
    userId: req.user!.id,
    signerName: req.user!.name,
    ipAddress: req.ip,
    userAgent: req.header("user-agent"),
  });

  await writeAuditLog({
    actorId: req.user!.id,
    actorLabel: req.user!.name,
    action: "RESOLUTION_SIGNED",
    targetType: "Dispute",
    targetId: dispute.id,
    result: "SUCCESS",
  });

  const updated = await resolutionService.getLatestResolution(dispute.id);
  res.json({ success: true, data: updated });
});
