/**
 * Nothing outside this folder should import "@/infrastructure/ai/gemini.provider"
 * directly, they should depend on this interface instead. That is the
 * whole point of the abstraction the spec asks for: a future second
 * provider (or a different Gemini API version) is a new file that
 * implements AIProvider, not a search-and-replace across the RAG module.
 */
export type EmbeddingTaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

export interface AIProvider {
  embed(text: string, taskType: EmbeddingTaskType): Promise<number[]>;

  /**
   * Generates a response constrained to the given JSON schema. Used for
   * every structured AI output (dispute analysis, etc.), the backend
   * validates the result against a Zod schema before trusting it, this
   * is a hint to the model, not a guarantee.
   */
  generateStructured(input: { systemPrompt: string; userPrompt: string; jsonSchema: object }): Promise<unknown>;

  generateText(input: { systemPrompt: string; userPrompt: string }): Promise<string>;
}
