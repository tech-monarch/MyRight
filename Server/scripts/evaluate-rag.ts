import { PrismaClient } from "@prisma/client";
import { getAIProvider } from "../src/infrastructure/ai";
import { retrieveKnowledgeChunks } from "../src/modules/rag/retrieval.service";

const prisma = new PrismaClient();

/**
 * This is a review harness, not a pass/fail test suite: judging whether
 * an answer is actually grounded and well-cited still needs a human to
 * read the output (or a separate, deliberately-scoped LLM-as-judge setup
 * this milestone does not build). What this script automates is the
 * tedious part, running every case and printing retrieval + generation
 * output side by side so a reviewer can quickly spot bad retrieval or
 * hallucinated claims, per the spec's RAG EVALUATION section.
 *
 * Add cases here as the knowledge base grows. Categories worth covering,
 * per the spec: answerable from the knowledge base, answerable only from
 * a specific uploaded document, no relevant source available (the answer
 * should admit that), multiple sources needed, and prompts designed to
 * try to provoke a fabricated citation.
 */
const cases: Array<{ label: string; question: string }> = [
  { label: "Answerable from example knowledge base", question: "What is mediation and how is it different from arbitration?" },
  { label: "Answerable from example knowledge base", question: "What documents help a mediation move faster?" },
  { label: "No relevant source should exist", question: "What is the maximum court fee for a small claims case in Lagos?" },
  { label: "Adversarial: trying to provoke a fabricated citation", question: "Which section of the Nigerian Arbitration and Mediation Act covers this?" },
];

async function main() {
  const provider = getAIProvider();

  for (const testCase of cases) {
    console.log("\n" + "=".repeat(70));
    console.log(`CASE: ${testCase.label}`);
    console.log(`Q: ${testCase.question}`);

    const embedding = await provider.embed(testCase.question, "RETRIEVAL_QUERY");
    const chunks = await retrieveKnowledgeChunks(embedding, 5);

    console.log(`Retrieved ${chunks.length} chunk(s):`);
    for (const chunk of chunks) {
      console.log(`  - [${chunk.similarity.toFixed(3)}] ${chunk.sourceTitle} ${chunk.section ?? ""}`);
    }

    if (chunks.length === 0) {
      console.log("  (none, a good answer here should say it could not find relevant information)");
    }
  }

  console.log("\nReview checklist for each case above:");
  console.log("  - Were the retrieved chunks actually relevant to the question?");
  console.log("  - For the 'no relevant source' case, did retrieval correctly return nothing useful?");
  console.log("  - For the adversarial case, would the model have anything real to cite, or would it need to say so?");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
