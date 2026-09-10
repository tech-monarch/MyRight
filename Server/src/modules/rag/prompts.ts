import type { RetrievedDocumentChunk, RetrievedKnowledgeChunk } from "@/modules/rag/retrieval.service";

/**
 * The rules every grounded generation call follows (spec section 13, "AI
 * should never invent law", and the RAG doc's "grounded generation"
 * section). Both analyzeDispute and chatReply in rag.service.ts share
 * this, a rule change only needs to happen in one place.
 */
const GROUNDING_RULES = `
You are MyRight's AI assistant, helping someone in Nigeria understand a dispute and their options for resolving it.

Ground rules, follow these strictly:
- Base every factual or legal claim on the "Retrieved context" provided below. Do not invent statutes, case law, or legal authorities that are not present in that context.
- If the retrieved context is not enough to answer part of the question, say so plainly rather than filling the gap with a guess. It is always better to say "I could not find enough information about that" than to invent an answer.
- Distinguish clearly between facts drawn from the retrieved context and your own inference or general guidance.
- You are not a lawyer and MyRight is not a law firm. Never present your output as definitive legal advice or a legal judgment, it is preliminary, AI-assisted information.
- When you reference something from the retrieved context, include it in the "sources" you return so the person can see where it came from. Never cite a source that is not in the retrieved context.
- Write in plain, calm, non-intimidating language. Avoid legal jargon where a simpler word works.
`.trim();

function formatContext(documentChunks: RetrievedDocumentChunk[], knowledgeChunks: RetrievedKnowledgeChunk[]): string {
  const parts: string[] = [];

  if (documentChunks.length > 0) {
    parts.push("Evidence the person has uploaded for this case:");
    for (const chunk of documentChunks) {
      parts.push(
        `[document:${chunk.id}] From "${chunk.fileName}"${chunk.pageNumber ? `, page ${chunk.pageNumber}` : ""}:\n${chunk.content}`
      );
    }
  }

  if (knowledgeChunks.length > 0) {
    parts.push("\nRelevant ADR/legal knowledge base entries:");
    for (const chunk of knowledgeChunks) {
      parts.push(
        `[knowledge:${chunk.id}] From "${chunk.sourceTitle}" (${chunk.authorityLevel.toLowerCase()})${
          chunk.section ? `, ${chunk.section}` : ""
        }:\n${chunk.content}`
      );
    }
  }

  if (parts.length === 0) {
    return "No relevant documents or knowledge base entries were retrieved for this question.";
  }

  return parts.join("\n\n");
}

export function buildAnalysisPrompt(input: {
  disputeTitle: string;
  disputeDescription: string;
  disputeType: string;
  desiredOutcome?: string | null;
  documentChunks: RetrievedDocumentChunk[];
  knowledgeChunks: RetrievedKnowledgeChunk[];
}): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `${GROUNDING_RULES}

Your task right now: analyze the dispute below and return a structured analysis matching the required JSON schema. "sources" must only include items whose [document:ID] or [knowledge:ID] tag appears in the retrieved context below, using that ID as the source's "id" field and "document" or "knowledge" as its "type".`;

  const userPrompt = `
Dispute title: ${input.disputeTitle}
Dispute type: ${input.disputeType}
Desired outcome: ${input.desiredOutcome || "Not specified"}

What the person described:
${input.disputeDescription}

Retrieved context:
${formatContext(input.documentChunks, input.knowledgeChunks)}
`.trim();

  return { systemPrompt, userPrompt };
}

export function buildChatPrompt(input: {
  disputeTitle: string;
  disputeSummary: string;
  conversationHistory: string;
  currentQuestion: string;
  documentChunks: RetrievedDocumentChunk[];
  knowledgeChunks: RetrievedKnowledgeChunk[];
}): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `${GROUNDING_RULES}

You are continuing a conversation with the person about their dispute. Respond conversationally in plain text (not JSON), and keep it focused, a few short paragraphs at most. If you use something from the retrieved context, mention which document or knowledge source it came from in plain language as part of your answer.`;

  const userPrompt = `
Dispute: ${input.disputeTitle}
Case summary: ${input.disputeSummary}

Conversation so far:
${input.conversationHistory || "(no previous messages)"}

Retrieved context for the current question:
${formatContext(input.documentChunks, input.knowledgeChunks)}

The person's current message:
${input.currentQuestion}
`.trim();

  return { systemPrompt, userPrompt };
}
