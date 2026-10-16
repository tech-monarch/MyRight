import type { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/AppError";
import { requireParam } from "@/utils/requireParam";
import { writeAuditLog } from "@/utils/audit-log";
import * as availabilityService from "@/modules/mediation/availability.service";
import * as sessionsService from "@/modules/mediation/sessions.service";
import * as disputesService from "@/modules/disputes/disputes.service";
import { canAccessDispute } from "@/modules/disputes/disputes.policy";

// --- Availability ---

export const getMyAvailability = asyncHandler(async (req: Request, res: Response) => {
  const slots = await availabilityService.getAvailability(req.user!.id);
  res.json({ success: true, data: slots });
});

export const setMyAvailability = asyncHandler(async (req: Request, res: Response) => {
  await availabilityService.setAvailability(req.user!.id, req.body.slots);
  const slots = await availabilityService.getAvailability(req.user!.id);
  res.json({ success: true, data: slots });
});

export const getLawyerAvailability = asyncHandler(async (req: Request, res: Response) => {
  // Low sensitivity ("Mondays 9-11am"), any authenticated user can view
  // a lawyer's weekly availability by id, see the schema comment. Not
  // exposed to anonymous/unauthenticated requests either way.
  const slots = await availabilityService.getAvailability(requireParam(req, "lawyerId"));
  res.json({ success: true, data: slots });
});

// --- Sessions ---

async function assertCanManageMediation(req: Request, disputeId: string) {
  const dispute = await disputesService.getDisputeOr404(disputeId);
  if (!canAccessDispute(req.user!, dispute, dispute.assignment)) throw AppError.notFound("Dispute not found");
  if (req.user!.role === "DISPUTANT") throw AppError.forbidden("Only the assigned mediator can manage sessions for this case.");
  return dispute;
}

export const listSessions = asyncHandler(async (req: Request, res: Response) => {
  const disputeId = requireParam(req, "disputeId");
  const dispute = await disputesService.getDisputeOr404(disputeId);
  if (!canAccessDispute(req.user!, dispute, dispute.assignment)) throw AppError.notFound("Dispute not found");

  const sessions = await sessionsService.listSessions(disputeId);

  // Best-effort: pull attendance for any session whose scheduled end has
  // passed but which has never been synced, so viewing the case picks up
  // a fresh attendance record without needing a separate manual action
  // or a background job. Failures here (Daily unreachable, etc.) should
  // never break loading the session list itself.
  const now = new Date();
  await Promise.all(
    sessions
      .filter((s) => s.dailyRoomName && s.scheduledEnd < now && s.attendance.length === 0)
      .map((s) => sessionsService.syncAttendance(s.id).catch(() => undefined))
  );

  const refreshed = await sessionsService.listSessions(disputeId);
  res.json({ success: true, data: refreshed });
});

export const createSession = asyncHandler(async (req: Request, res: Response) => {
  const disputeId = requireParam(req, "disputeId");
  const dispute = await assertCanManageMediation(req, disputeId);

  if (!dispute.assignment) {
    throw AppError.badRequest("This case needs an assigned mediator before a session can be scheduled.");
  }
  if (req.user!.role === "LAWYER" && dispute.assignment.lawyerId !== req.user!.id) {
    throw AppError.forbidden("You are not the mediator assigned to this case.");
  }
  if (dispute.status === "AWAITING_OTHER_PARTY") {
    throw AppError.badRequest(
      dispute.otherPartyResponse === "DECLINED"
        ? "The other party declined mediation, so a session can't be scheduled."
        : "A session can be scheduled once the other party accepts the mediation invitation."
    );
  }
  const lawyerId = dispute.assignment.lawyerId;

  const session = await sessionsService.createSession({
    disputeId,
    lawyerId,
    createdById: req.user!.id,
    scheduledStart: new Date(req.body.scheduledStart),
    scheduledEnd: new Date(req.body.scheduledEnd),
    useDailyVideo: req.body.useDailyVideo,
    manualMeetingUrl: req.body.manualMeetingUrl,
  });

  await writeAuditLog({
    actorId: req.user!.id,
    actorLabel: req.user!.name,
    action: "MEDIATION_SESSION_SCHEDULED",
    targetType: "Dispute",
    targetId: disputeId,
    result: "SUCCESS",
  });

  res.status(201).json({ success: true, data: session });
});

export const cancelSession = asyncHandler(async (req: Request, res: Response) => {
  const disputeId = requireParam(req, "disputeId");
  await assertCanManageMediation(req, disputeId);
  const session = await sessionsService.cancelSession(requireParam(req, "sessionId"), disputeId);
  res.json({ success: true, data: session });
});

export const submitOutcomeNotes = asyncHandler(async (req: Request, res: Response) => {
  const disputeId = requireParam(req, "disputeId");
  await assertCanManageMediation(req, disputeId);
  const session = await sessionsService.submitOutcomeNotes(
    requireParam(req, "sessionId"),
    disputeId,
    req.body.outcomeNotes
  );

  await writeAuditLog({
    actorId: req.user!.id,
    actorLabel: req.user!.name,
    action: "MEDIATION_SESSION_OUTCOME_RECORDED",
    targetType: "Dispute",
    targetId: disputeId,
    result: "SUCCESS",
  });

  res.json({ success: true, data: session });
});

export const getJoinUrl = asyncHandler(async (req: Request, res: Response) => {
  const disputeId = requireParam(req, "disputeId");
  const dispute = await disputesService.getDisputeOr404(disputeId);
  if (!canAccessDispute(req.user!, dispute, dispute.assignment)) throw AppError.notFound("Dispute not found");

  const url = await sessionsService.getJoinUrl({
    sessionId: requireParam(req, "sessionId"),
    disputeId,
    userName: req.user!.name,
    isMediator: req.user!.role === "LAWYER" || req.user!.role === "SUPERADMIN",
  });
  res.json({ success: true, data: { url } });
});
