import type { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/AppError";
import { requireParam } from "@/utils/requireParam";
import { writeAuditLog } from "@/utils/audit-log";
import * as availabilityService from "@/modules/mediation/availability.service";
import * as sessionsService from "@/modules/mediation/sessions.service";
import * as disputesService from "@/modules/disputes/disputes.service";
import { canAccessDispute } from "@/modules/disputes/disputes.policy";
import { getGoogleAuthUrl, connectGoogleAccount, disconnectGoogleAccount, getGoogleConnectionStatus, signState, verifyState } from "@/infrastructure/google/google-oauth";
import { env } from "@/config/env";

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
  res.json({ success: true, data: sessions });
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
  const lawyerId = dispute.assignment.lawyerId;

  const session = await sessionsService.createSession({
    disputeId,
    lawyerId,
    createdById: req.user!.id,
    scheduledStart: new Date(req.body.scheduledStart),
    scheduledEnd: new Date(req.body.scheduledEnd),
    useGoogleMeet: req.body.useGoogleMeet,
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

// --- Google connect ---

export const getGoogleStatus = asyncHandler(async (req: Request, res: Response) => {
  const status = await getGoogleConnectionStatus(req.user!.id);
  res.json({ success: true, data: status });
});

export const startGoogleConnect = asyncHandler(async (req: Request, res: Response) => {
  const url = getGoogleAuthUrl(signState(req.user!.id));
  res.json({ success: true, data: { url } });
});

// Not behind requireAuth, see the comment in google-oauth.ts on why the
// session cookie doesn't survive this redirect. Trust comes entirely
// from the signed state, not from req.user.
export const googleCallback = asyncHandler(async (req: Request, res: Response) => {
  const state = req.query.state as string | undefined;
  const code = req.query.code as string | undefined;
  const userId = state ? verifyState(state) : null;

  if (!userId || !code) {
    return res.redirect(`${env.APP_URL}/lawyer/settings?google=error`);
  }

  try {
    await connectGoogleAccount(userId, code);
    await writeAuditLog({
      actorId: userId,
      actorLabel: userId,
      action: "GOOGLE_ACCOUNT_CONNECTED",
      targetType: "User",
      targetId: userId,
      result: "SUCCESS",
    });
    res.redirect(`${env.APP_URL}/lawyer/settings?google=connected`);
  } catch (err) {
    console.error("Google OAuth callback failed", err);
    res.redirect(`${env.APP_URL}/lawyer/settings?google=error`);
  }
});

export const disconnectGoogle = asyncHandler(async (req: Request, res: Response) => {
  await disconnectGoogleAccount(req.user!.id);
  res.json({ success: true, data: null });
});
