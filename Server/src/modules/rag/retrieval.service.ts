import { prisma } from "@/infrastructure/database/prisma";
import { toVectorLiteral } from "@/modules/rag/pgvector";

export interface RetrievedDocumentChunk {
  id: string;
  documentId: string;
  content: string;
  pageNumber: number | null;
  chunkIndex: number;
  fileName: string;
  similarity: number;
}

export interface RetrievedKnowledgeChunk {
  id: string;
  sourceId: string;
  content: string;
  section: string | null;
  pageNumber: number | null;
  sourceTitle: string;
  authorityLevel: string;
  similarity: number;
}

// Chunks below this similarity are treated as noise rather than context.
// Cosine similarity of 0.3 is a conservative floor, tuned down further
// once real retrieval-quality evaluation (see rag/evaluation) has data
// to tune it against.
const MIN_SIMILARITY = 0.3;

/**
 * Scoped to a single disputeId, which the caller must already have
 * verified the current user can access (see rag.controller.ts). This
 * query has no notion of "current user" itself, on purpose, mixing
 * authorization logic into a retrieval query makes both harder to
 * verify. Authorization happens once, before this is ever called.
 */
export async function retrieveDocumentChunks(
  disputeId: string,
  queryEmbedding: number[],
  limit = 6
): Promise<RetrievedDocumentChunk[]> {
  const vector = toVectorLiteral(queryEmbedding);
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      documentId: string;
      content: string;
      pageNumber: number | null;
      chunkIndex: number;
      fileName: string;
      similarity: number;
    }>
  >`
    SELECT dc.id, dc."documentId", dc.content, dc."pageNumber", dc."chunkIndex",
           d."fileName",
           1 - (dc.embedding <=> ${vector}::vector) AS similarity
    FROM document_chunks dc
    JOIN documents d ON d.id = dc."documentId"
    WHERE dc."disputeId" = ${disputeId}
    ORDER BY dc.embedding <=> ${vector}::vector ASC
    LIMIT ${limit}
  `;
  return rows.filter((r) => r.similarity >= MIN_SIMILARITY);
}

export async function retrieveKnowledgeChunks(
  queryEmbedding: number[],
  limit = 6,
  filters?: { jurisdiction?: string }
): Promise<RetrievedKnowledgeChunk[]> {
  const vector = toVectorLiteral(queryEmbedding);
  const jurisdiction = filters?.jurisdiction ?? null;

  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      sourceId: string;
      content: string;
      section: string | null;
      pageNumber: number | null;
      sourceTitle: string;
      authorityLevel: string;
      similarity: number;
    }>
  >`
    SELECT kc.id, kc."sourceId", kc.content, kc.section, kc."pageNumber",
           ks.title AS "sourceTitle", ks."authorityLevel"::text AS "authorityLevel",
           1 - (kc.embedding <=> ${vector}::vector) AS similarity
    FROM knowledge_chunks kc
    JOIN knowledge_sources ks ON ks.id = kc."sourceId"
    WHERE (${jurisdiction}::text IS NULL OR ks.jurisdiction = ${jurisdiction})
    ORDER BY
      -- Authoritative sources are preferred over informational ones at
      -- equal similarity, a straightforward version of the "authority
      -- weighting" the RAG spec asks for without a separate reranking
      -- step.
      (ks."authorityLevel" = 'AUTHORITATIVE') DESC,
      kc.embedding <=> ${vector}::vector ASC
    LIMIT ${limit}
  `;
  return rows.filter((r) => r.similarity >= MIN_SIMILARITY);
}
