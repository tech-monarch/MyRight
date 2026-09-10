import { Router } from "express";
import * as ragController from "@/modules/rag/rag.controller";
import { validateBody } from "@/middleware/validate";
import { requireAuth } from "@/middleware/auth";
import { requireCsrf } from "@/middleware/csrf";

export const ragRouter = Router({ mergeParams: true });

ragRouter.use(requireAuth);

ragRouter.post("/analysis", requireCsrf, ragController.runAnalysis);
ragRouter.get("/analysis", ragController.getLatestAnalysis);

ragRouter.get("/messages", ragController.listMessages);
ragRouter.post(
  "/messages",
  requireCsrf,
  validateBody(ragController.sendMessageSchema),
  ragController.sendMessage
);
