import { Router } from "express";
import * as mediationController from "@/modules/mediation/mediation.controller";
import { createSessionSchema, submitOutcomeNotesSchema } from "@/modules/mediation/mediation.schemas";
import { validateBody } from "@/middleware/validate";
import { requireAuth } from "@/middleware/auth";
import { requireCsrf } from "@/middleware/csrf";

export const sessionsRouter = Router({ mergeParams: true });

sessionsRouter.use(requireAuth);

sessionsRouter.get("/", mediationController.listSessions);
sessionsRouter.post("/", requireCsrf, validateBody(createSessionSchema), mediationController.createSession);
sessionsRouter.get("/:sessionId/join", mediationController.getJoinUrl);
sessionsRouter.post("/:sessionId/cancel", requireCsrf, mediationController.cancelSession);
sessionsRouter.post(
  "/:sessionId/outcome",
  requireCsrf,
  validateBody(submitOutcomeNotesSchema),
  mediationController.submitOutcomeNotes
);
