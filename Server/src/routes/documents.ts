import { Router, Response } from "express";
import multer from "multer";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { prisma } from "@/infrastructure/database/prisma";
import { storeDocument } from "@/modules/documents/documents.service";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

router.post(
  "/upload",
  requireAuth,
  upload.array("files", 5),
  async (req: AuthRequest, res: Response) => {
    const files = req.files as Express.Multer.File[];
    const caseId = String(req.body.caseId || "");

    if (!caseId || !files?.length) {
      res
        .status(400)
        .json({ error: "caseId and at least one file are required" });
      return;
    }

    try {
      const dispute = await prisma.dispute.findFirst({
        where: { id: caseId, ownerId: req.user.id, deletedAt: null },
      });
      if (!dispute) {
        res.status(404).json({ error: "Dispute not found" });
        return;
      }

      const documents = await Promise.all(
        files.map((file) =>
          storeDocument({
            disputeId: caseId,
            uploaderId: req.user.id,
            file,
          }),
        ),
      );
      res.json({ success: true, documents });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  },
);

router.get("/:caseId", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const dispute = await prisma.dispute.findFirst({
      where: { id: req.params.caseId, ownerId: req.user.id, deletedAt: null },
    });
    if (!dispute) {
      res.status(404).json({ error: "Dispute not found" });
      return;
    }
    const documents = await prisma.document.findMany({
      where: { disputeId: req.params.caseId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ documents });
  } catch (error) {
    console.error("Fetch documents error:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

export default router;
