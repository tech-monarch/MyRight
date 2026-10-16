import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "@/utils/asyncHandler";
import { requireParam } from "@/utils/requireParam";
import { writeAuditLog } from "@/utils/audit-log";
import { validateBody } from "@/middleware/validate";
import { requireAuth, requireRole } from "@/middleware/auth";
import { requireCsrf } from "@/middleware/csrf";
import { accountFieldsSchema, updateLawyerStatusSchema } from "@/modules/admin/admin.schemas";
import { toPublicLawyer } from "@/modules/admin/admin.helpers";
import * as platformService from "@/modules/platform/platform.service";

export const platformRouter = Router();

// The platform owner only. Deliberately has no route into individual disputes.
platformRouter.use(requireAuth, requireRole("PLATFORM_ADMIN"));

platformRouter.get(
  "/courthouses",
  asyncHandler(async (_req, res) => {
    res.json({ success: true, data: await platformService.listCourthouses() });
  })
);

platformRouter.post(
  "/courthouses",
  requireCsrf,
  validateBody(z.object({ name: z.string().trim().min(2), admin: accountFieldsSchema })),
  asyncHandler(async (req, res) => {
    const { courthouse, admin, tempPassword } = await platformService.createCourthouse(req.body);
    await writeAuditLog({ actorId: req.user!.id, actorLabel: req.user!.name, action: "COURTHOUSE_CREATED", targetType: "Courthouse", targetId: courthouse.id, result: "SUCCESS" });
    // tempPassword appears in this one response only.
    res.status(201).json({ success: true, data: { courthouse, admin: toPublicLawyer(admin), tempPassword } });
  })
);

platformRouter.post(
  "/courthouses/:id/admins",
  requireCsrf,
  validateBody(accountFieldsSchema),
  asyncHandler(async (req, res) => {
    const { user, tempPassword } = await platformService.addCourthouseAdmin(requireParam(req, "id"), req.body);
    await writeAuditLog({ actorId: req.user!.id, actorLabel: req.user!.name, action: "COURTHOUSE_ADMIN_CREATED", targetType: "User", targetId: user.id, result: "SUCCESS" });
    res.status(201).json({ success: true, data: { admin: toPublicLawyer(user), tempPassword } });
  })
);

platformRouter.post(
  "/admins/:id/status",
  requireCsrf,
  validateBody(updateLawyerStatusSchema),
  asyncHandler(async (req, res) => {
    const admin = await platformService.setAdminStatus(requireParam(req, "id"), req.body.status);
    await writeAuditLog({ actorId: req.user!.id, actorLabel: req.user!.name, action: `COURTHOUSE_ADMIN_STATUS_${req.body.status}`, targetType: "User", targetId: admin.id, result: "SUCCESS" });
    res.json({ success: true, data: toPublicLawyer(admin) });
  })
);

platformRouter.post(
  "/admins/:id/reset-password",
  requireCsrf,
  asyncHandler(async (req, res) => {
    const tempPassword = await platformService.resetAdminPassword(requireParam(req, "id"));
    await writeAuditLog({ actorId: req.user!.id, actorLabel: req.user!.name, action: "COURTHOUSE_ADMIN_PASSWORD_RESET", targetType: "User", targetId: requireParam(req, "id"), result: "SUCCESS" });
    res.json({ success: true, data: { tempPassword } });
  })
);
