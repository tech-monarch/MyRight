import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/AppError";
import { requireParam } from "@/utils/requireParam";
import { writeAuditLog } from "@/utils/audit-log";
import * as disputesService from "@/modules/disputes/disputes.service";
import { canAccessDispute } from "@/modules/disputes/disputes.policy";
import * as ragService from "@/modules/rag/rag.service";

export const sendMessageSchema = z.object({
  message: z.string().trim().min(1).max(4000),
});

async function assertDisputeAccess(req: Request) {
  const disputeId = requireParam(req, "disputeId");
  const dispute = await disputesService.getDisputeOr404(disputeId);
  if (!canAccessDispute(req.user!, dispute, dispute.assignment)) {
    throw AppError.notFound("Dispute not found");
  }
  return dispute;
}

export const runAnalysis = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await assertDisputeAccess(req);
  const analysis = await ragService.analyzeDispute(dispute);

  await writeAuditLog({
    actorId: req.user!.id,
    actorLabel: req.user!.name,
    action: "AI_ANALYSIS_GENERATED",
    targetType: "Dispute",
    targetId: dispute.id,
    result: "SUCCESS",
  });

  res.status(201).json({ success: true, data: analysis });
});

export const getLatestAnalysis = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await assertDisputeAccess(req);
  const analysis = await ragService.getLatestAnalysis(dispute.id);
  res.json({ success: true, data: analysis });
});

export const listMessages = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await assertDisputeAccess(req);
  const messages = await ragService.listChatMessages(dispute.id);
  res.json({ success: true, data: messages });
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await assertDisputeAccess(req);
  const { userMessage, assistantMessage } = await ragService.sendChatMessage(dispute, req.body.message);
  res.status(201).json({ success: true, data: { userMessage, assistantMessage } });
});
