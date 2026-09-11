import { Router } from "express";
import type { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { requireAuth, requireRole } from "@/middleware/auth";
import { requireCsrf } from "@/middleware/csrf";
import { whatsAppProvider } from "@/infrastructure/notifications/whatsapp.provider";
import { writeAuditLog } from "@/utils/audit-log";

export const whatsappRouter = Router();

whatsappRouter.use(requireAuth, requireRole("SUPERADMIN"));

whatsappRouter.get(
  "/status",
  asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: whatsAppProvider.getStatus() });
  })
);

whatsappRouter.post(
  "/connect",
  requireCsrf,
  asyncHandler(async (req: Request, res: Response) => {
    await whatsAppProvider.start();
    await writeAuditLog({
      actorId: req.user!.id,
      actorLabel: req.user!.name,
      action: "WHATSAPP_CONNECT_STARTED",
      targetType: "WhatsApp",
      result: "SUCCESS",
    });
    res.json({ success: true, data: whatsAppProvider.getStatus() });
  })
);

whatsappRouter.post(
  "/disconnect",
  requireCsrf,
  asyncHandler(async (req: Request, res: Response) => {
    await whatsAppProvider.disconnect();
    await writeAuditLog({
      actorId: req.user!.id,
      actorLabel: req.user!.name,
      action: "WHATSAPP_DISCONNECTED",
      targetType: "WhatsApp",
      result: "SUCCESS",
    });
    res.json({ success: true, data: whatsAppProvider.getStatus() });
  })
);
