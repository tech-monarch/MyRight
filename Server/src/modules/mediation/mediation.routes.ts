import { Router } from "express";
import * as mediationController from "@/modules/mediation/mediation.controller";
import { setAvailabilitySchema } from "@/modules/mediation/mediation.schemas";
import { validateBody } from "@/middleware/validate";
import { requireAuth, requireRole } from "@/middleware/auth";
import { requireCsrf } from "@/middleware/csrf";

export const mediationRouter = Router();

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
