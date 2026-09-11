import { Router } from "express";
import * as mediationController from "@/modules/mediation/mediation.controller";
import { setAvailabilitySchema } from "@/modules/mediation/mediation.schemas";
import { validateBody } from "@/middleware/validate";
import { requireAuth, requireRole } from "@/middleware/auth";
import { requireCsrf } from "@/middleware/csrf";

export const mediationRouter = Router();

// The Google OAuth callback cannot require auth (see the comment in
// mediation.controller.ts), it is mounted before the requireAuth below.
mediationRouter.get("/google/callback", mediationController.googleCallback);

mediationRouter.use(requireAuth);

mediationRouter.get("/availability/me", requireRole("LAWYER"), mediationController.getMyAvailability);
mediationRouter.put(
  "/availability/me",
  requireRole("LAWYER"),
  requireCsrf,
  validateBody(setAvailabilitySchema),
  mediationController.setMyAvailability
);
mediationRouter.get("/availability/:lawyerId", mediationController.getLawyerAvailability);

mediationRouter.get("/google/status", requireRole("LAWYER"), mediationController.getGoogleStatus);
mediationRouter.post("/google/connect", requireRole("LAWYER"), requireCsrf, mediationController.startGoogleConnect);
mediationRouter.post("/google/disconnect", requireRole("LAWYER"), requireCsrf, mediationController.disconnectGoogle);
