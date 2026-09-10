import { env } from "@/config/env";
import { AppError } from "@/utils/AppError";
import type { AIProvider, EmbeddingTaskType } from "@/infrastructure/ai/ai.provider";

/**
 * Talks to the Gemini API directly over REST (generativelanguage.googleapis.com)
 * rather than through Google's SDK. That SDK's surface has changed
 * repeatedly (see README "AI Architecture" for the model-churn notes),
 * the plain REST endpoints documented at ai.google.dev have stayed
 * stable for far longer, and a fetch-based client has one dependency
 * (fetch itself, built into Node 18+) instead of a fast-moving package.
 */
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

async function callGemini(path: string, body: unknown): Promise<any> {
  if (!env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not set. AI features are unavailable until it is configured in .env."
    );
  }

  const res = await fetch(`${BASE_URL}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.GEMINI_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    // Never forward the raw Gemini error (it can include request
    // internals) straight to the client, log it server side and surface
    // a generic message instead.
    console.error("Gemini API error", res.status, errorBody);
    throw new AppError(502, "AI_PROVIDER_ERROR", "The AI service is temporarily unavailable. Please try again.");
  }

  return res.json();
}

export class GeminiProvider implements AIProvider {
  async embed(text: string, taskType: EmbeddingTaskType): Promise<number[]> {
    const result = await callGemini(`models/${env.GEMINI_EMBEDDING_MODEL}:embedContent`, {
      content: { parts: [{ text }] },
      taskType,
      outputDimensionality: env.GEMINI_EMBEDDING_DIMENSIONS,
    });

    const values = result?.embedding?.values;
    if (!Array.isArray(values)) {
      throw new AppError(502, "AI_PROVIDER_ERROR", "The AI service returned an unexpected embedding response.");
    }
    return values;
  }

  async generateStructured(input: { systemPrompt: string; userPrompt: string; jsonSchema: object }): Promise<unknown> {
    const result = await callGemini(`models/${env.GEMINI_MODEL}:generateContent`, {
      systemInstruction: { parts: [{ text: input.systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: input.userPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: input.jsonSchema,
        temperature: 0.2, // Low temperature: this output is grounded legal-adjacent
        // guidance, not creative writing, prefer consistency over variety.
      },
    });

    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") {
      throw new AppError(502, "AI_PROVIDER_ERROR", "The AI service returned an unexpected response.");
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new AppError(502, "AI_PROVIDER_ERROR", "The AI service returned a response that could not be parsed.");
    }
  }

  async generateText(input: { systemPrompt: string; userPrompt: string }): Promise<string> {
    const result = await callGemini(`models/${env.GEMINI_MODEL}:generateContent`, {
      systemInstruction: { parts: [{ text: input.systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: input.userPrompt }] }],
      generationConfig: { temperature: 0.3 },
    });

    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") {
      throw new AppError(502, "AI_PROVIDER_ERROR", "The AI service returned an unexpected response.");
    }
    return text;
  }
}
