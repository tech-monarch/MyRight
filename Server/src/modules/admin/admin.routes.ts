import { Router } from "express";
import * as adminController from "@/modules/admin/admin.controller";
import { createLawyerSchema, updateLawyerStatusSchema, assignCaseSchema } from "@/modules/admin/admin.schemas";
import { validateBody } from "@/middleware/validate";
import { requireAuth, requireRole } from "@/middleware/auth";
import { requireCsrf } from "@/middleware/csrf";

export const adminRouter = Router();

// Every route in this file requires an authenticated SUPERADMIN. There is
// no per-route role check below because it would be redundant, and
// redundant checks that can silently drift out of sync are worse than one
// checked in a single place.
adminRouter.use(requireAuth, requireRole("SUPERADMIN"));

adminRouter.get("/lawyers", adminController.listLawyers);
adminRouter.post("/lawyers", requireCsrf, validateBody(createLawyerSchema), adminController.createLawyer);
adminRouter.get("/lawyers/:id", adminController.getLawyer);
adminRouter.post(
  "/lawyers/:id/status",
  requireCsrf,
  validateBody(updateLawyerStatusSchema),
  adminController.updateLawyerStatus
);
adminRouter.post("/lawyers/:id/reset-password", requireCsrf, adminController.resetLawyerPassword);
adminRouter.post(
  "/lawyers/:id/assignments",
  requireCsrf,
  validateBody(assignCaseSchema),
  adminController.assignCase
);
adminRouter.delete("/assignments/:disputeId", requireCsrf, adminController.removeAssignment);

adminRouter.get("/cases", adminController.listCourthouseCases);
adminRouter.get("/audit-log", adminController.listAuditLog);
