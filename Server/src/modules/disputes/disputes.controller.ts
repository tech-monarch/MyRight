import type { Request, Response } from "express";
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

  const updated = await disputesService.transitionStatus(
    dispute.id,
    dispute.status,
    "MEDIATION_REQUESTED",
    req.user!.id,
    req.body.contact ? `Invited other party via ${req.body.contactMethod}: ${req.body.contact}` : undefined
  );

  await writeAuditLog({
    actorId: req.user!.id,
    actorLabel: req.user!.name,
    action: "MEDIATION_REQUESTED",
    targetType: "Dispute",
    targetId: dispute.id,
    result: "SUCCESS",
  });

  res.json({ success: true, data: updated });
});

export const getDisputeHistory = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await disputesService.getDisputeOr404(requireParam(req, "id"));
  if (!canAccessDispute(req.user!, dispute, dispute.assignment)) {
    throw AppError.notFound("Dispute not found");
  }
  const history = await disputesService.listStatusHistory(dispute.id);
  res.json({ success: true, data: history });
});
