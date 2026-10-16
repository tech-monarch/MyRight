import { Router } from "express";
import * as adminController from "@/modules/admin/admin.controller";
import {
  createLawyerSchema,
  updateLawyerStatusSchema,
  assignCaseSchema,
  createStaffSchema,
  updateStaffPermissionsSchema,
} from "@/modules/admin/admin.schemas";
import { validateBody } from "@/middleware/validate";
import { requireAnyPermission, requireAuth, requireRole } from "@/middleware/auth";
import { requireCsrf } from "@/middleware/csrf";

export const adminRouter = Router();

// Two roles can enter this router: courthouse admins (SUPERADMIN, who hold
// every permission in their own courthouse) and courthouse staff. Staff are
// let in here, and then EACH ROUTE below states the delegated permission it
// needs; a route with no permission check would be open to every staff member.
adminRouter.use(requireAuth, requireRole("SUPERADMIN", "COURTHOUSE_STAFF"));

const seeLawyers = requireAnyPermission("MANAGE_LAWYERS", "ASSIGN_CASES");
const manageLawyers = requireAnyPermission("MANAGE_LAWYERS");
const assignCases = requireAnyPermission("ASSIGN_CASES");
const seeCases = requireAnyPermission("VIEW_CASES", "ASSIGN_CASES");
const adminOnly = requireRole("SUPERADMIN");

adminRouter.get("/lawyers", seeLawyers, adminController.listLawyers);
adminRouter.post("/lawyers", requireCsrf, manageLawyers, validateBody(createLawyerSchema), adminController.createLawyer);
adminRouter.get("/lawyers/:id", seeLawyers, adminController.getLawyer);
adminRouter.post(
  "/lawyers/:id/status",
  requireCsrf,
  manageLawyers,
  validateBody(updateLawyerStatusSchema),
  adminController.updateLawyerStatus
);
adminRouter.post("/lawyers/:id/reset-password", requireCsrf, manageLawyers, adminController.resetLawyerPassword);
adminRouter.post(
  "/lawyers/:id/assignments",
  requireCsrf,
  assignCases,
  validateBody(assignCaseSchema),
  adminController.assignCase
);
adminRouter.delete("/assignments/:disputeId", requireCsrf, assignCases, adminController.removeAssignment);

adminRouter.get("/cases", seeCases, adminController.listCourthouseCases);

// Courthouse admin only: the audit log, and delegating powers to staff.
adminRouter.get("/audit-log", adminOnly, adminController.listAuditLog);
adminRouter.get("/staff", adminOnly, adminController.listStaff);
adminRouter.post("/staff", requireCsrf, adminOnly, validateBody(createStaffSchema), adminController.createStaff);
adminRouter.post(
  "/staff/:id/permissions",
  requireCsrf,
  adminOnly,
  validateBody(updateStaffPermissionsSchema),
  adminController.updateStaffPermissions
);
adminRouter.post(
  "/staff/:id/status",
  requireCsrf,
  adminOnly,
  validateBody(updateLawyerStatusSchema),
  adminController.updateStaffStatus
);
adminRouter.post("/staff/:id/reset-password", requireCsrf, adminOnly, adminController.resetStaffPassword);
