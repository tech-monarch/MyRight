import { Router } from "express";
import * as disputesController from "@/modules/disputes/disputes.controller";
import { createDisputeSchema, updateDisputeSchema, mediationRequestSchema } from "@/modules/disputes/disputes.schemas";
import { validateBody } from "@/middleware/validate";
import { requireAuth, requireRole } from "@/middleware/auth";
import { requireCsrf } from "@/middleware/csrf";
import { documentsRouter } from "@/modules/documents/documents.routes";
import { ragRouter } from "@/modules/rag/rag.routes";
import { sessionsRouter } from "@/modules/mediation/sessions.routes";
import { resolutionRouter } from "@/modules/resolution/resolution.routes";

export const disputesRouter = Router();

disputesRouter.use(requireAuth);

disputesRouter.get("/", requireRole("DISPUTANT", "LAWYER"), disputesController.listMyDisputes);
disputesRouter.post(
  "/",
  requireRole("DISPUTANT"),
  requireCsrf,
  validateBody(createDisputeSchema),
  disputesController.createDispute
);
disputesRouter.get("/:id", disputesController.getDispute);
disputesRouter.get("/:id/history", disputesController.getDisputeHistory);
disputesRouter.patch(
  "/:id",
  requireCsrf,
  validateBody(updateDisputeSchema),
  disputesController.updateDispute
);
disputesRouter.post(
  "/:id/mediation-request",
  requireCsrf,
  validateBody(mediationRequestSchema),
  disputesController.requestMediation
);

disputesRouter.use("/:disputeId/documents", documentsRouter);
disputesRouter.use("/:disputeId", ragRouter);
disputesRouter.use("/:disputeId/sessions", sessionsRouter);
disputesRouter.use("/:disputeId/resolution", resolutionRouter);
