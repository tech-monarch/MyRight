import type { Request, Response } from "express";
import * as invitationsService from "@/modules/invitations/invitations.service";
import * as mediationRequestService from "@/modules/disputes/mediation-request.service";
import { asyncHandler } from "@/utils/asyncHandler";
import { requireParam } from "@/utils/requireParam";
import { AppError } from "@/utils/AppError";
import { writeAuditLog } from "@/utils/audit-log";
import * as disputesService from "@/modules/disputes/disputes.service";
import { canAccessDispute, canModifyDispute } from "@/modules/disputes/disputes.policy";

export const listMyDisputes = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const disputes =
    user.role === "LAWYER"
      ? await disputesService.listDisputesForLawyer(user.id)
      : await disputesService.listDisputesForOwner(user.id);
  res.json({ success: true, data: disputes });
});

export const createDispute = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await disputesService.createDispute(req.user!.id, req.body);
  await writeAuditLog({
    actorId: req.user!.id,
    actorLabel: req.user!.name,
    action: "DISPUTE_CREATED",
    targetType: "Dispute",
    targetId: dispute.id,
    result: "SUCCESS",
  });
  res.status(201).json({ success: true, data: dispute });
});

export const getDispute = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await disputesService.getDisputeOr404(requireParam(req, "id"));
  const allowed = canAccessDispute(req.user!, dispute, dispute.assignment);

  if (!allowed) {
    await writeAuditLog({
      actorId: req.user!.id,
      actorLabel: req.user!.name,
      action: "DISPUTE_ACCESS_ATTEMPT",
      targetType: "Dispute",
      targetId: dispute.id,
      result: "DENIED",
    });
    // 404, not 403: a lawyer probing sequential ids should not be able to
    // tell "exists but not mine" apart from "does not exist".
    throw AppError.notFound("Dispute not found");
  }

  res.json({ success: true, data: dispute });
});

export const updateDispute = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await disputesService.getDisputeOr404(requireParam(req, "id"));
  if (!canAccessDispute(req.user!, dispute, dispute.assignment)) {
    throw AppError.notFound("Dispute not found");
  }
  if (!canModifyDispute(req.user!, dispute)) {
    throw AppError.forbidden("This case can no longer be edited.");
  }

  const updated = await disputesService.updateDispute(dispute.id, req.body);
  res.json({ success: true, data: updated });
});

export const requestMediation = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await disputesService.getDisputeOr404(requireParam(req, "id"));
  if (!canAccessDispute(req.user!, dispute, dispute.assignment)) {
    throw AppError.notFound("Dispute not found");
  }
  if (req.user!.role !== "DISPUTANT" || dispute.ownerId !== req.user!.id) {
    throw AppError.forbidden("Only the case owner can request mediation.");
  }

  const result = await mediationRequestService.requestMediation({
    dispute,
    requesterId: req.user!.id,
    requesterName: req.user!.name,
    contactMethod: req.body.contactMethod,
    contact: req.body.contact,
  });

  // A repeat request changes nothing, so it isn't logged as a new event.
  if (!result.alreadyRequested) {
    await writeAuditLog({
      actorId: req.user!.id,
      actorLabel: req.user!.name,
      action: "MEDIATION_REQUESTED",
      targetType: "Dispute",
      targetId: dispute.id,
      result: "SUCCESS",
    });
  }

  // inviteUrl lets the owner copy and share the link by hand if automatic delivery fails.
  res.json({
    success: true,
    data: { ...result.dispute, inviteUrl: result.inviteUrl, alreadyRequested: result.alreadyRequested },
  });
});

export const getDisputeHistory = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await disputesService.getDisputeOr404(requireParam(req, "id"));
  if (!canAccessDispute(req.user!, dispute, dispute.assignment)) {
    throw AppError.notFound("Dispute not found");
  }
  const history = await disputesService.listStatusHistory(dispute.id);
  res.json({ success: true, data: history });
});

export const resendInvitation = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await disputesService.getDisputeOr404(requireParam(req, "id"));
  if (req.user!.role !== "DISPUTANT" || dispute.ownerId !== req.user!.id) {
    throw AppError.forbidden("Only the case owner can resend the invitation.");
  }
  if (dispute.status !== "AWAITING_OTHER_PARTY" || dispute.otherPartyResponse !== "PENDING" || !dispute.otherPartyContact) {
    throw AppError.badRequest("There is no pending invitation to resend.");
  }
  const { respondUrl } = await invitationsService.sendInvitation({
    disputeId: dispute.id,
    disputeTitle: dispute.title,
    requesterName: req.user!.name,
    contact: dispute.otherPartyContact,
  });
  res.json({ success: true, data: { inviteUrl: respondUrl } });
});
