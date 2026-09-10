import type { AIProvider } from "@/infrastructure/ai/ai.provider";
import { GeminiProvider } from "@/infrastructure/ai/gemini.provider";

let instance: AIProvider | null = null;

/**
 * Only Gemini exists today (per the "Gemini-powered RAG, non-negotiable"
 * requirement), this factory function still exists, rather than importing
 * GeminiProvider directly everywhere, so a second provider is a one-line
 * change here instead of a change everywhere GeminiProvider was imported.
 */
export function getAIProvider(): AIProvider {
  if (!instance) instance = new GeminiProvider();
  return instance;
}
