import { Router } from "express";
import multer from "multer";
import * as documentsController from "@/modules/documents/documents.controller";
import { requireAuth } from "@/middleware/auth";
import { requireCsrf } from "@/middleware/csrf";
import { MAX_UPLOAD_BYTES } from "@/modules/documents/documents.service";

// mergeParams so this router can read :disputeId from its parent mount
// point in disputes.routes.ts.
export const documentsRouter = Router({ mergeParams: true });

// Memory storage, not disk: the buffer goes straight to the active
// storage provider (local disk or S3) inside documents.service.ts, so
// there is never an intermediate temp file on the API server itself.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_UPLOAD_BYTES } });

documentsRouter.use(requireAuth);

documentsRouter.get("/", documentsController.listDocuments);
documentsRouter.post("/", requireCsrf, upload.single("file"), documentsController.uploadDocument);
documentsRouter.get("/:documentId/download", documentsController.downloadDocument);
