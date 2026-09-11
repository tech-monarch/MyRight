import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { prisma } from "@/infrastructure/database/prisma";

const router = Router();

type ChatInput = { role: string; content: string };

function parseMessages(
  value: unknown,
): Array<{ role: "USER" | "ASSISTANT"; content: string }> {
  if (!Array.isArray(value)) return [];
  return value
    .filter((message): message is ChatInput =>
      Boolean(message && typeof message === "object" && "content" in message),
    )
    .map((message) => ({
      role: message.role?.toLowerCase() === "assistant" ? "ASSISTANT" : "USER",
      content: String(message.content),
    }));
}

router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const { messages, caseId, sessionId } = req.body;
  const disputeId = sessionId || caseId;

  if (!disputeId) {
    res
      .status(400)
      .json({ error: "caseId is required to save a chat session" });
    return;
  }

  try {
    const dispute = await prisma.dispute.findFirst({
      where: { id: disputeId, ownerId: req.user.id, deletedAt: null },
    });
    if (!dispute) {
      res.status(404).json({ error: "Dispute not found" });
      return;
    }

    const parsedMessages = parseMessages(messages);
    await prisma.$transaction([
      prisma.chatMessage.deleteMany({ where: { disputeId } }),
      prisma.chatMessage.createMany({
        data: parsedMessages.map((message) => ({ ...message, disputeId })),
      }),
    ]);

    res.json({
      session: { id: disputeId, caseId: disputeId, messages: parsedMessages },
    });
  } catch (error) {
    console.error("Chat session error:", error);
    res.status(500).json({ error: "Failed to save chat session" });
  }
});

router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const disputes = await prisma.dispute.findMany({
      where: { ownerId: req.user.id, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      include: { chatMessages: { orderBy: { createdAt: "asc" } } },
    });

    res.json({
      sessions: disputes.map((dispute) => ({
        id: dispute.id,
        caseId: dispute.id,
        messages: dispute.chatMessages,
        updated_at: dispute.updatedAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat sessions" });
  }
});

router.get("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const dispute = await prisma.dispute.findFirst({
      where: { id: req.params.id, ownerId: req.user.id, deletedAt: null },
      include: { chatMessages: { orderBy: { createdAt: "asc" } } },
    });
    if (!dispute) {
      res.status(404).json({ error: "Chat session not found" });
      return;
    }
    res.json({
      session: {
        id: dispute.id,
        caseId: dispute.id,
        messages: dispute.chatMessages,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await prisma.chatMessage.deleteMany({
      where: { disputeId: req.params.id, dispute: { ownerId: req.user.id } },
    });
    res.json({ success: true, deletedMessages: result.count });
  } catch (error) {
    console.error("Delete chat session error:", error);
    res.status(500).json({ error: "Failed to delete chat session" });
  }
});

export default router;
