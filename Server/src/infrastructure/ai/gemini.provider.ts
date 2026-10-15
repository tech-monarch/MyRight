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

const RETRYABLE_STATUS = new Set([429, 500, 503, 504]);
const MAX_ATTEMPTS = 3; // 1 try + 2 retries, never more

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const providerError = () =>
  new AppError(502, "AI_PROVIDER_ERROR", "The AI service is temporarily unavailable. Please try again.");

/** One model, bounded retries on transient failures only (429/5xx/timeout/network). */
async function callModel(path: string, body: unknown): Promise<{ json?: any; retryableFailure: boolean }> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let retryable = false;
    try {
      const res = await fetch(`${BASE_URL}/${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY!,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(env.GEMINI_TIMEOUT_MS),
      });
      if (res.ok) return { json: await res.json(), retryableFailure: false };

      const errorBody = await res.text().catch(() => "");
      // Logged server side only; never forwarded to the client.
      console.error("Gemini API error", res.status, errorBody, `(attempt ${attempt}/${MAX_ATTEMPTS})`);
      retryable = RETRYABLE_STATUS.has(res.status);
      if (!retryable) return { retryableFailure: false }; // 400/401/403/404: retrying can't help
    } catch (err) {
      // Timeout or network failure.
      console.error("Gemini request failed", err instanceof Error ? err.name : "unknown", `(attempt ${attempt}/${MAX_ATTEMPTS})`);
      retryable = true;
    }
    if (attempt < MAX_ATTEMPTS) {
      const backoff = env.GEMINI_RETRY_BASE_MS * 3 ** (attempt - 1); // 1x, 3x
      await sleep(backoff + Math.floor(Math.random() * backoff * 0.3));
    }
  }
  return { retryableFailure: true };
}

async function callGemini(path: string, body: unknown, fallbackPath?: string): Promise<any> {
  if (!env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not set. AI features are unavailable until it is configured in .env."
    );
  }

  const primary = await callModel(path, body);
  if (primary.json !== undefined) return primary.json;

  // Overloaded/unavailable after retries: one attempt on the fallback model, if configured.
  if (primary.retryableFailure && fallbackPath) {
    const fallback = await callModel(fallbackPath, body);
    if (fallback.json !== undefined) return fallback.json;
  }
  throw providerError();
}

const generatePath = (model: string) => `models/${model}:generateContent`;
const fallbackGeneratePath = () =>
  env.GEMINI_FALLBACK_MODEL && env.GEMINI_FALLBACK_MODEL !== env.GEMINI_MODEL
    ? generatePath(env.GEMINI_FALLBACK_MODEL)
    : undefined;

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
    const result = await callGemini(generatePath(env.GEMINI_MODEL), {
      systemInstruction: { parts: [{ text: input.systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: input.userPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: input.jsonSchema,
        temperature: 0.2, // Low temperature: this output is grounded legal-adjacent
        // guidance, not creative writing, prefer consistency over variety.
      },
    }, fallbackGeneratePath());

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
    const result = await callGemini(generatePath(env.GEMINI_MODEL), {
      systemInstruction: { parts: [{ text: input.systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: input.userPrompt }] }],
      generationConfig: { temperature: 0.3 },
    }, fallbackGeneratePath());

    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") {
      throw new AppError(502, "AI_PROVIDER_ERROR", "The AI service returned an unexpected response.");
    }
    return text;
  }
}
