import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { prisma } from "@/infrastructure/database/prisma";

const router = Router();

const displayStatus = (status: string) => {
  switch (status) {
    case "IN_MEDIATION":
      return "In Mediation";
    case "RESOLVED":
      return "Resolved";
    case "AWAITING_OTHER_PARTY":
      return "Invited Party";
    default:
      return "AI Assessment";
  }
};

const dashboardDispute = (dispute: {
  id: string;
  description: string;
  type: string;
  status: string;
  createdAt: Date;
  otherPartyName: string | null;
  otherPartyContact: string | null;
}) => ({
  id: dispute.id,
  title:
    dispute.description.slice(0, 60) +
    (dispute.description.length > 60 ? "..." : ""),
  category: dispute.type,
  status: displayStatus(dispute.status),
  dateInitiated: dispute.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }),
  opponentName: dispute.otherPartyName,
  opponentContact: dispute.otherPartyContact,
});

router.get("/stats", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const where = { ownerId: req.user.id, deletedAt: null };
    const [total, active, resolved] = await Promise.all([
      prisma.dispute.count({ where }),
      prisma.dispute.count({
        where: {
          ...where,
          status: {
            in: ["MEDIATION_REQUESTED", "AWAITING_OTHER_PARTY", "IN_MEDIATION"],
          },
        },
      }),
      prisma.dispute.count({ where: { ...where, status: "RESOLVED" } }),
    ]);
    res.json({
      totalDisputes: total,
      activeMediations: active,
      resolvedCases: resolved,
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

router.get(
  "/disputes",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const disputes = await prisma.dispute.findMany({
        where: { ownerId: req.user.id, deletedAt: null },
        orderBy: { createdAt: "desc" },
      });
      res.json({ disputes: disputes.map(dashboardDispute) });
    } catch (error) {
      console.error("Disputes error:", error);
      res.status(500).json({ error: "Failed to fetch disputes" });
    }
  },
);

router.patch(
  "/disputes/:id",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const {
      status,
      category,
      opponent_name,
      opponent_contact,
      opponent_email,
      opponent_phone,
      opponent_organization,
    } = req.body;
    try {
      const existing = await prisma.dispute.findFirst({
        where: { id: req.params.id, ownerId: req.user.id, deletedAt: null },
      });
      if (!existing) {
        res
          .status(404)
          .json({ error: "Dispute not found or not owned by you" });
        return;
      }
      await prisma.dispute.update({
        where: { id: req.params.id },
        data: {
          ...(status ? { status } : {}),
          ...(category ? { type: category } : {}),
          ...(opponent_name ? { otherPartyName: opponent_name } : {}),
          ...(opponent_contact ||
          opponent_email ||
          opponent_phone ||
          opponent_organization
            ? {
                otherPartyContact:
                  opponent_contact ||
                  opponent_email ||
                  opponent_phone ||
                  opponent_organization,
              }
            : {}),
        },
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Update dispute error:", error);
      res.status(500).json({ error: "Failed to update dispute" });
    }
  },
);

router.delete(
  "/disputes/:id",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.dispute.findFirst({
        where: { id: req.params.id, ownerId: req.user.id, deletedAt: null },
      });
      if (!existing) {
        res
          .status(404)
          .json({ error: "Dispute not found or not owned by you" });
        return;
      }
      await prisma.dispute.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date() },
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Delete dispute error:", error);
      res.status(500).json({ error: "Failed to delete dispute" });
    }
  },
);

router.get(
  "/disputes/:id",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const dispute = await prisma.dispute.findFirst({
        where: { id: req.params.id, ownerId: req.user.id, deletedAt: null },
      });
      if (!dispute) {
        res.status(404).json({ error: "Dispute not found" });
        return;
      }
      res.json({ dispute: dashboardDispute(dispute) });
    } catch (error) {
      console.error("Fetch dispute error:", error);
      res.status(500).json({ error: "Failed to fetch dispute" });
    }
  },
);

export default router;
