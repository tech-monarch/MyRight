import type { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/AppError";
import { requireParam } from "@/utils/requireParam";
import { writeAuditLog } from "@/utils/audit-log";
import * as disputesService from "@/modules/disputes/disputes.service";
import { canAccessDispute } from "@/modules/disputes/disputes.policy";
import * as documentsService from "@/modules/documents/documents.service";
import { enqueueIngestion } from "@/jobs/ingestion-queue";

/**
 * Shared by every handler in this file: confirms the dispute exists and
 * the authenticated user is allowed to see it, using the exact same
 * policy function the disputes module uses. Documents inherit their
 * parent dispute's access rules rather than having their own separate
 * (and possibly inconsistent) authorization logic.
 */
async function assertDisputeAccess(req: Request) {
  const disputeId = requireParam(req, "disputeId");
  const dispute = await disputesService.getDisputeOr404(disputeId);
  if (!canAccessDispute(req.user!, dispute, dispute.assignment)) {
    throw AppError.notFound("Dispute not found");
  }
  return dispute;
}

export const listDocuments = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await assertDisputeAccess(req);
  const documents = await documentsService.listDocuments(dispute.id);
  res.json({ success: true, data: documents });
});

export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await assertDisputeAccess(req);
  const file = req.file;
  if (!file) throw AppError.badRequest("No file was uploaded.");

  const document = await documentsService.storeDocument({
    disputeId: dispute.id,
    uploaderId: req.user!.id,
    file: {
      buffer: file.buffer,
      mimetype: file.mimetype,
      size: file.size,
      originalname: file.originalname,
    },
  });

  await writeAuditLog({
    actorId: req.user!.id,
    actorLabel: req.user!.name,
    action: "DOCUMENT_UPLOADED",
    targetType: "Document",
    targetId: document.id,
    result: "SUCCESS",
    metadata: { disputeId: dispute.id, fileName: document.fileName },
  });

  enqueueIngestion(document.id);

  res.status(201).json({ success: true, data: document });
});

export const downloadDocument = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await assertDisputeAccess(req);
  const documentId = requireParam(req, "documentId");

  const target = await documentsService.getDownloadTarget(documentId, dispute.id);

  await writeAuditLog({
    actorId: req.user!.id,
    actorLabel: req.user!.name,
    action: "DOCUMENT_ACCESSED",
    targetType: "Document",
    targetId: documentId,
    result: "SUCCESS",
  });

  if (target.kind === "redirect") {
    return res.redirect(target.url);
  }

  res.setHeader("Content-Type", target.document.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${target.document.fileName}"`);
  res.send(target.buffer);
});
