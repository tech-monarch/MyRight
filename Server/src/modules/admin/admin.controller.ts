import type { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/AppError";
import { writeAuditLog } from "@/utils/audit-log";
import { prisma } from "@/infrastructure/database/prisma";
import * as adminService from "@/modules/admin/admin.service";
import * as disputesService from "@/modules/disputes/disputes.service";
import { toPublicLawyer } from "@/modules/admin/admin.helpers";
import { requireParam } from "@/utils/requireParam";

function courthouseIdOrThrow(req: Request): string {
  const id = req.user?.courthouseId;
  if (!id) throw AppError.forbidden("Your account is not associated with a courthouse.");
  return id;
}

export const listLawyers = asyncHandler(async (req: Request, res: Response) => {
  const lawyers = await adminService.listLawyers(courthouseIdOrThrow(req));
  res.json({ success: true, data: lawyers.map(toPublicLawyer) });
});

export const getLawyer = asyncHandler(async (req: Request, res: Response) => {
  const lawyer = await adminService.getLawyerInCourthouseOr404(requireParam(req, "id"), courthouseIdOrThrow(req));
  res.json({ success: true, data: toPublicLawyer(lawyer) });
});

export const createLawyer = asyncHandler(async (req: Request, res: Response) => {
  const { lawyer, tempPassword } = await adminService.createLawyer(courthouseIdOrThrow(req), req.body);
  await writeAuditLog({
    actorId: req.user!.id,
    actorLabel: req.user!.name,
    action: "LAWYER_CREATED",
    targetType: "User",
    targetId: lawyer.id,
    result: "SUCCESS",
  });
  // tempPassword appears in this one response only, see admin.service.ts.
  res.status(201).json({ success: true, data: { lawyer: toPublicLawyer(lawyer), tempPassword } });
});

export const updateLawyerStatus = asyncHandler(async (req: Request, res: Response) => {
  const lawyer = await adminService.setLawyerStatus(requireParam(req, "id"), courthouseIdOrThrow(req), req.body.status);
  await writeAuditLog({
    actorId: req.user!.id,
    actorLabel: req.user!.name,
    action: `LAWYER_STATUS_${req.body.status}`,
    targetType: "User",
    targetId: lawyer.id,
    result: "SUCCESS",
  });
  res.json({ success: true, data: toPublicLawyer(lawyer) });
});

export const resetLawyerPassword = asyncHandler(async (req: Request, res: Response) => {
  const tempPassword = await adminService.resetLawyerPassword(requireParam(req, "id"), courthouseIdOrThrow(req));
  await writeAuditLog({
    actorId: req.user!.id,
    actorLabel: req.user!.name,
    action: "LAWYER_PASSWORD_RESET",
    targetType: "User",
    targetId: requireParam(req, "id"),
    result: "SUCCESS",
  });
  res.json({ success: true, data: { tempPassword } });
});

export const assignCase = asyncHandler(async (req: Request, res: Response) => {
  const assignment = await adminService.assignCase(
    requireParam(req, "id"),
    courthouseIdOrThrow(req),
    req.body.disputeId,
    req.user!.id
  );
  await writeAuditLog({
    actorId: req.user!.id,
    actorLabel: req.user!.name,
    action: "CASE_ASSIGNED",
    targetType: "Dispute",
    targetId: req.body.disputeId,
    result: "SUCCESS",
    metadata: { lawyerId: requireParam(req, "id") },
  });
  res.status(201).json({ success: true, data: assignment });
});

export const removeAssignment = asyncHandler(async (req: Request, res: Response) => {
  await adminService.removeAssignment(requireParam(req, "disputeId"), courthouseIdOrThrow(req));
  await writeAuditLog({
    actorId: req.user!.id,
    actorLabel: req.user!.name,
    action: "CASE_UNASSIGNED",
    targetType: "Dispute",
    targetId: requireParam(req, "disputeId"),
    result: "SUCCESS",
  });
  res.json({ success: true, data: null });
});

export const listCourthouseCases = asyncHandler(async (req: Request, res: Response) => {
  const cases = await disputesService.listDisputesForCourthouse(courthouseIdOrThrow(req));
  res.json({ success: true, data: cases });
});

export const listAuditLog = asyncHandler(async (_req: Request, res: Response) => {
  // Known limitation: AuditLog rows are not tagged with a courthouseId, so
  // this currently returns the whole platform's log, correct for a
  // single-courthouse deployment but needs a courthouseId column added
  // before a second courthouse is onboarded (see README "Known Issues").
  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  res.json({ success: true, data: entries });
});
