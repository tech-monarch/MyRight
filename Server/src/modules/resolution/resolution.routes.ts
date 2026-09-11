import { Router } from "express";
import * as resolutionController from "@/modules/resolution/resolution.controller";
import { createResolutionSchema } from "@/modules/resolution/resolution.schemas";
import { validateBody } from "@/middleware/validate";
import { requireAuth } from "@/middleware/auth";
import { requireCsrf } from "@/middleware/csrf";

export const resolutionRouter = Router({ mergeParams: true });

resolutionRouter.use(requireAuth);

resolutionRouter.get("/", resolutionController.getResolution);
resolutionRouter.post("/", requireCsrf, validateBody(createResolutionSchema), resolutionController.createResolution);
resolutionRouter.post("/sign", requireCsrf, resolutionController.signAsDisputant);
