import { readFileSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";
import { getAIProvider } from "../src/infrastructure/ai";
import { chunkText } from "../src/modules/rag/chunking";
import { toVectorLiteral } from "../src/modules/rag/pgvector";

const prisma = new PrismaClient();

/**
 * The manifest is the source of truth for each knowledge base document's
 * metadata. Adding a real document means adding its file to
 * knowledge-base/ and an entry here, filling in every field honestly,
 * especially sourceUrl and authorityLevel, since those are what let the
 * retrieval layer prefer authoritative sources (see
 * rag/retrieval.service.ts) and let a reader verify a citation
 * themselves.
 */
const manifest: Array<{
  file: string;
  title: string;
  sourceType: "LEGISLATION" | "ADR_FRAMEWORK" | "GUIDANCE" | "CASE_LAW" | "OTHER";
  authorityLevel: "AUTHORITATIVE" | "INFORMATIONAL";
  jurisdiction?: string;
  sourceUrl?: string;
}> = [
  {
    file: "examples/what-is-adr.txt",
    title: "[EXAMPLE PLACEHOLDER] What is Alternative Dispute Resolution",
    sourceType: "OTHER",
    authorityLevel: "INFORMATIONAL",
  },
  {
    file: "examples/typical-mediation-process.txt",
    title: "[EXAMPLE PLACEHOLDER] What generally happens during mediation",
    sourceType: "OTHER",
    authorityLevel: "INFORMATIONAL",
  },
];

async function main() {
  const provider = getAIProvider();
  const root = path.join(__dirname, "..", "knowledge-base");

  for (const entry of manifest) {
    console.log(`Ingesting: ${entry.title}`);
    const text = readFileSync(path.join(root, entry.file), "utf-8");

    const source = await prisma.knowledgeSource.create({
      data: {
        title: entry.title,
        sourceType: entry.sourceType,
        authorityLevel: entry.authorityLevel,
        jurisdiction: entry.jurisdiction,
        sourceUrl: entry.sourceUrl,
      },
    });

    const chunks = chunkText(text);
    for (const chunk of chunks) {
      const embedding = await provider.embed(chunk.content, "RETRIEVAL_DOCUMENT");
      await prisma.$executeRaw`
        INSERT INTO knowledge_chunks (id, "sourceId", content, embedding, "chunkIndex", "createdAt")
        VALUES (${randomUUID()}, ${source.id}, ${chunk.content}, ${toVectorLiteral(embedding)}::vector, ${chunk.chunkIndex}, now())
      `;
    }
    console.log(`  -> ${chunks.length} chunk(s) embedded and stored.`);
  }

  console.log("Knowledge base ingestion complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
