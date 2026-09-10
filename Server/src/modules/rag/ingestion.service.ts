import { randomUUID } from "crypto";
import { prisma } from "@/infrastructure/database/prisma";
import { getStorageProvider } from "@/infrastructure/storage";
import { getAIProvider } from "@/infrastructure/ai";
import { extractText } from "@/modules/rag/text-extraction";
import { chunkText } from "@/modules/rag/chunking";
import { toVectorLiteral } from "@/modules/rag/pgvector";

/**
 * Runs the full pipeline for one document: download -> extract -> chunk
 * -> embed -> store. Called by the in-process ingestion queue
 * (jobs/ingestion-queue.ts) after upload, never called synchronously
 * inside the upload request handler, so a slow embedding call never
 * makes the person uploading a file wait for it.
 */
export async function ingestDocument(documentId: string): Promise<void> {
  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document) return; // Deleted before the job ran, nothing to do.

  await prisma.document.update({ where: { id: documentId }, data: { status: "PROCESSING" } });

  try {
    const buffer = await getStorageProvider().getObject(document.storageKey);
    const extracted = await extractText(buffer, document.mimeType);

    if (!extracted || !extracted.text.trim()) {
      // Not an error, just nothing this pipeline can search yet (an
      // image with no OCR, or a legacy .doc file). The file itself is
      // still safely stored and downloadable.
      await prisma.document.update({ where: { id: documentId }, data: { status: "READY" } });
      return;
    }

    const chunks = chunkText(extracted.text);
    const provider = getAIProvider();

    for (const chunk of chunks) {
      const embedding = await provider.embed(chunk.content, "RETRIEVAL_DOCUMENT");
      await prisma.$executeRaw`
        INSERT INTO document_chunks (id, "documentId", "disputeId", content, embedding, "chunkIndex", "createdAt")
        VALUES (${randomUUID()}, ${documentId}, ${document.disputeId}, ${chunk.content}, ${toVectorLiteral(embedding)}::vector, ${chunk.chunkIndex}, now())
      `;
    }

    await prisma.document.update({ where: { id: documentId }, data: { status: "READY", ingestError: null } });
  } catch (err) {
    console.error(`Ingestion failed for document ${documentId}`, err);
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "FAILED", ingestError: err instanceof Error ? err.message : "Unknown error" },
    });
  }
}
