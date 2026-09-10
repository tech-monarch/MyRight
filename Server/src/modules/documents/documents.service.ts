import { randomUUID } from "crypto";
import path from "path";
import { prisma } from "@/infrastructure/database/prisma";
import { getStorageProvider } from "@/infrastructure/storage";
import { AppError } from "@/utils/AppError";

// Deliberately narrow. Every format here is one MyRight's own UI (mock
// evidence upload) already offers, "anything users might send" is how you
// end up hosting arbitrary file types with your own domain's authority.
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB

function safeExtension(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  // Only allow a short alphanumeric extension through, anything else
  // (including path traversal attempts like "../../x.pdf") is dropped.
  return /^\.[a-z0-9]{1,5}$/.test(ext) ? ext : "";
}

export function validateUpload(file: { mimetype: string; size: number; originalname: string }) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    throw AppError.badRequest(
      "That file type isn't supported. Please upload a PDF, JPG, PNG, DOC, or DOCX file."
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw AppError.badRequest("That file is too large. The maximum size is 15 MB.");
  }
}

export async function storeDocument(input: {
  disputeId: string;
  uploaderId: string;
  file: { buffer: Buffer; mimetype: string; size: number; originalname: string };
}) {
  validateUpload(input.file);

  // The storage key is a fresh random id, never the user-supplied
  // filename. This is what actually prevents path traversal and
  // filename-collision attacks, the extension check above is only a
  // second layer.
  const key = `disputes/${input.disputeId}/${randomUUID()}${safeExtension(input.file.originalname)}`;

  await getStorageProvider().putObject(key, input.file.buffer, input.file.mimetype);

  return prisma.document.create({
    data: {
      disputeId: input.disputeId,
      uploaderId: input.uploaderId,
      fileName: input.file.originalname.slice(0, 255),
      storageKey: key,
      mimeType: input.file.mimetype,
      sizeBytes: input.file.size,
      // Text extraction/chunking/embedding (the RAG ingestion pipeline)
      // is a separate milestone. Until that exists, a document is simply
      // "uploaded", it does not move to READY on its own.
      status: "UPLOADED",
    },
  });
}

export function listDocuments(disputeId: string) {
  return prisma.document.findMany({ where: { disputeId }, orderBy: { createdAt: "desc" } });
}

export async function getDocumentOr404(disputeId: string, documentId: string) {
  const document = await prisma.document.findFirst({ where: { id: documentId, disputeId } });
  if (!document) throw AppError.notFound("Document not found");
  return document;
}

export async function getDownloadTarget(documentId: string, disputeId: string) {
  const document = await getDocumentOr404(disputeId, documentId);
  const provider = getStorageProvider();
  const signedUrl = await provider.getSignedDownloadUrl(document.storageKey);
  if (signedUrl) return { kind: "redirect" as const, url: signedUrl, document };

  const buffer = await provider.getObject(document.storageKey);
  return { kind: "stream" as const, buffer, document };
}
