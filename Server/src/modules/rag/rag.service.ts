import { prisma } from "@/infrastructure/database/prisma";
import { getAIProvider } from "@/infrastructure/ai";
import { retrieveDocumentChunks, retrieveKnowledgeChunks } from "@/modules/rag/retrieval.service";
import { buildAnalysisPrompt, buildChatPrompt } from "@/modules/rag/prompts";
import { disputeAnalysisSchema, disputeAnalysisJsonSchema, type DisputeAnalysis } from "@/modules/rag/rag.schemas";
import { AppError } from "@/utils/AppError";
import type { Dispute } from "@prisma/client";

const RETRIEVAL_LIMIT_PER_SOURCE = 6;

// How much conversation history to send verbatim. Beyond this, older
// turns are dropped rather than summarized, an actual running summary
// (per the spec's "conversational RAG" section) is a reasonable next
// step once real usage shows conversations regularly running longer
// than this in practice, added now it would be complexity in search of
// a problem that has not been observed yet.
const MAX_HISTORY_MESSAGES = 12;

export async function analyzeDispute(dispute: Dispute): Promise<DisputeAnalysis> {
  const provider = getAIProvider();
  const queryText = `${dispute.title}\n${dispute.description}`;
  const queryEmbedding = await provider.embed(queryText, "RETRIEVAL_QUERY");

  const [documentChunks, knowledgeChunks] = await Promise.all([
    retrieveDocumentChunks(dispute.id, queryEmbedding, RETRIEVAL_LIMIT_PER_SOURCE),
    retrieveKnowledgeChunks(queryEmbedding, RETRIEVAL_LIMIT_PER_SOURCE),
  ]);

  const { systemPrompt, userPrompt } = buildAnalysisPrompt({
    disputeTitle: dispute.title,
    disputeDescription: dispute.description,
    disputeType: dispute.type,
    desiredOutcome: dispute.desiredOutcome,
    documentChunks,
    knowledgeChunks,
  });

  const raw = await provider.generateStructured({
    systemPrompt,
    userPrompt,
    jsonSchema: disputeAnalysisJsonSchema,
  });

  const parsed = disputeAnalysisSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(502, "AI_PROVIDER_ERROR", "The AI service returned a response in an unexpected format.");
  }

  await prisma.aIAnalysis.create({ data: { disputeId: dispute.id, result: parsed.data as any } });

  return parsed.data;
}

export async function getLatestAnalysis(disputeId: string): Promise<DisputeAnalysis | null> {
  const latest = await prisma.aIAnalysis.findFirst({
    where: { disputeId },
    orderBy: { createdAt: "desc" },
  });
  return latest ? (latest.result as unknown as DisputeAnalysis) : null;
}

export async function listChatMessages(disputeId: string) {
  return prisma.chatMessage.findMany({ where: { disputeId }, orderBy: { createdAt: "asc" } });
}

export async function sendChatMessage(dispute: Dispute, userMessage: string) {
  const history = await prisma.chatMessage.findMany({
    where: { disputeId: dispute.id },
    orderBy: { createdAt: "desc" },
    take: MAX_HISTORY_MESSAGES,
  });
  history.reverse();

  const provider = getAIProvider();
  const queryEmbedding = await provider.embed(userMessage, "RETRIEVAL_QUERY");

  const [documentChunks, knowledgeChunks] = await Promise.all([
    retrieveDocumentChunks(dispute.id, queryEmbedding, RETRIEVAL_LIMIT_PER_SOURCE),
    retrieveKnowledgeChunks(queryEmbedding, RETRIEVAL_LIMIT_PER_SOURCE),
  ]);

  const { systemPrompt, userPrompt } = buildChatPrompt({
    disputeTitle: dispute.title,
    disputeSummary: dispute.description,
    conversationHistory: history.map((m) => `${m.role === "USER" ? "Person" : "MyRight AI"}: ${m.content}`).join("\n"),
    currentQuestion: userMessage,
    documentChunks,
    knowledgeChunks,
  });

  const replyText = await provider.generateText({ systemPrompt, userPrompt });

  const sources = [
    ...documentChunks.map((c) => `${c.fileName}`),
    ...knowledgeChunks.map((c) => `${c.sourceTitle}`),
  ];
  const uniqueSources = Array.from(new Set(sources));

  const [userRow, assistantRow] = await prisma.$transaction([
    prisma.chatMessage.create({ data: { disputeId: dispute.id, role: "USER", content: userMessage } }),
    prisma.chatMessage.create({
      data: { disputeId: dispute.id, role: "ASSISTANT", content: replyText, sources: uniqueSources },
    }),
  ]);

  return { userMessage: userRow, assistantMessage: assistantRow };
}
