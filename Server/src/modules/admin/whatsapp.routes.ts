import { Router } from "express";
import type { Request, Response } from "express";
import type { UserRole } from "@prisma/client";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/AppError";
import { validateBody } from "@/middleware/validate";
import { requireAuth, requireRole } from "@/middleware/auth";
import { requireCsrf } from "@/middleware/csrf";
import { whatsAppManager, PLATFORM_SCOPE } from "@/infrastructure/notifications/whatsapp.provider";
import { writeAuditLog } from "@/utils/audit-log";
import { z } from "zod";

const numberSchema = z.object({ number: z.string().trim().min(1) });
const connectSchema = z.object({ mode: z.enum(["code", "qr"]).default("code") });

/**
 * One router, two mounts: the platform owner manages the default number,
 * and each courthouse admin manages their courthouse's own number. The only
 * difference is which "scope" the request acts on, decided server-side from
 * the logged-in user, never taken from the request.
 */
export function createWhatsappRouter(role: UserRole, scopeFor: (req: Request) => string, allowRemoveOverride: boolean) {
  const router = Router();
  router.use(requireAuth, requireRole(role));

  const audit = (req: Request, action: string) =>
    writeAuditLog({
      actorId: req.user!.id,
      actorLabel: req.user!.name,
      action,
      targetType: "WhatsApp",
      targetId: scopeFor(req),
      result: "SUCCESS",
    });

  router.get(
    "/status",
    asyncHandler(async (req: Request, res: Response) => {
      const own = await whatsAppManager.getStatus(scopeFor(req));
      const platform = allowRemoveOverride ? await whatsAppManager.getStatus(PLATFORM_SCOPE) : null;
      res.json({ success: true, data: { ...own, platformDefault: platform ? { status: platform.status, number: platform.number } : null } });
    })
  );

  router.put(
    "/number",
    requireCsrf,
    validateBody(numberSchema),
    asyncHandler(async (req: Request, res: Response) => {
      await whatsAppManager.setNumber(scopeFor(req), req.body.number);
      await audit(req, "WHATSAPP_NUMBER_CHANGED");
      res.json({ success: true, data: await whatsAppManager.getStatus(scopeFor(req)) });
    })
  );

  router.post(
    "/connect",
    requireCsrf,
    validateBody(connectSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const status = await whatsAppManager.connect(scopeFor(req), req.body.mode);
      await audit(req, "WHATSAPP_CONNECT_STARTED");
      res.json({ success: true, data: status });
    })
  );

  router.post(
    "/disconnect",
    requireCsrf,
    asyncHandler(async (req: Request, res: Response) => {
      const status = await whatsAppManager.disconnect(scopeFor(req));
      await audit(req, "WHATSAPP_DISCONNECTED");
      res.json({ success: true, data: status });
    })
  );

  if (allowRemoveOverride) {
    // Courthouse admins only: drop the courthouse's own number and go back to the platform default.
    router.delete(
      "/number",
      requireCsrf,
      asyncHandler(async (req: Request, res: Response) => {
        await whatsAppManager.removeOverride(scopeFor(req));
        await audit(req, "WHATSAPP_OVERRIDE_REMOVED");
        res.json({ success: true, data: await whatsAppManager.getStatus(scopeFor(req)) });
      })
    );
  }

  return router;
}

export const courthouseWhatsappRouter = createWhatsappRouter(
  "SUPERADMIN",
  (req) => {
    const id = req.user?.courthouseId;
    if (!id) throw AppError.forbidden("Your account is not associated with a courthouse.");
    return id;
  },
  true
);

export const platformWhatsappRouter = createWhatsappRouter("PLATFORM_ADMIN", () => PLATFORM_SCOPE, false);
