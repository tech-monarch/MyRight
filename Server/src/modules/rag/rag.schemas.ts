import { z } from "zod";

// Mirrors the shape suggested in the product spec. Every AI response the
// backend hands to the frontend is validated against this before it
// leaves this process, an ungrounded or malformed model response never
// reaches the client silently.
export const disputeAnalysisSchema = z.object({
  summary: z.string(),
  issues: z.array(z.string()),
  possibleADRPaths: z.array(z.string()),
  urgency: z.enum(["low", "medium", "high"]),
  recommendedNextSteps: z.array(z.string()),
  risks: z.array(z.string()),
  questionsForUser: z.array(z.string()),
  sources: z.array(
    z.object({
      type: z.enum(["knowledge", "document"]),
      id: z.string(),
      title: z.string(),
      detail: z.string().optional(),
    })
  ),
});

export type DisputeAnalysis = z.infer<typeof disputeAnalysisSchema>;

// The Gemini-API-flavored JSON Schema passed as responseSchema. Kept in
// sync with disputeAnalysisSchema above by hand, Zod does not export to
// this format directly, if they drift, the Zod parse below is the safety
// net that will catch it.
export const disputeAnalysisJsonSchema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    issues: { type: "array", items: { type: "string" } },
    possibleADRPaths: { type: "array", items: { type: "string" } },
    urgency: { type: "string", enum: ["low", "medium", "high"] },
    recommendedNextSteps: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
    questionsForUser: { type: "array", items: { type: "string" } },
    sources: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["knowledge", "document"] },
          id: { type: "string" },
          title: { type: "string" },
          detail: { type: "string" },
        },
        required: ["type", "id", "title"],
      },
    },
  },
  required: [
    "summary",
    "issues",
    "possibleADRPaths",
    "urgency",
    "recommendedNextSteps",
    "risks",
    "questionsForUser",
    "sources",
  ],
};
