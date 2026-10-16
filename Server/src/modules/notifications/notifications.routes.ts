import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { requireParam } from "@/utils/requireParam";
import { requireAuth } from "@/middleware/auth";
import { requireCsrf } from "@/middleware/csrf";
import { prisma } from "@/infrastructure/database/prisma";

export const notificationsRouter = Router();

// Every query below is scoped to req.user.id: nobody can read or mark someone else's notifications.
notificationsRouter.use(requireAuth);

notificationsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    // The bell polls this every minute: count-only avoids fetching 50 rows each time.
    if (req.query.countOnly) {
      const unreadCount = await prisma.notification.count({ where: { userId, readAt: null } });
      return res.json({ success: true, data: { unreadCount } });
    }
    const [items, unreadCount] = await Promise.all([
      prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    res.json({ success: true, data: { items, unreadCount } });
  })
);

notificationsRouter.post(
  "/read-all",
  requireCsrf,
  asyncHandler(async (req, res) => {
    await prisma.notification.updateMany({ where: { userId: req.user!.id, readAt: null }, data: { readAt: new Date() } });
    res.json({ success: true, data: null });
  })
);

notificationsRouter.post(
  "/:id/read",
  requireCsrf,
  asyncHandler(async (req, res) => {
    await prisma.notification.updateMany({
      where: { id: requireParam(req, "id"), userId: req.user!.id, readAt: null },
      data: { readAt: new Date() },
    });
    res.json({ success: true, data: null });
  })
);
