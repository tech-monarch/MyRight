/**
 * Placeholder AI client.
 *
 * The real RAG/Gemini pipeline is a later milestone (backend). This file
 * simulates the shape of what that pipeline will return -- structured
 * analysis with citations, and grounded chat replies -- so the intake
 * wizard and AI assistant UI can be fully built and reviewed now. Swapping
 * this for real calls to `/api/ai/*` later shouldn't require UI changes,
 * since components consume these same types.
 */

export interface DisputeAnalysis {
  disputeType: string;
  urgency: "low" | "medium" | "high";
  summary: string;
  possibleADRPaths: string[];
  recommendedNextSteps: string[];
  missingInformation: string[];
  sources: { title: string; note: string }[];
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function analyzeDispute(input: {
  description: string;
  category?: string;
}): Promise<DisputeAnalysis> {
  await delay(1400);

  // Very light keyword classification just to make the mock feel responsive
  // to what the person actually typed, rather than always returning the
  // same canned result.
  const text = input.description.toLowerCase();
  const isTenancy = /landlord|rent|deposit|apartment|tenant/.test(text);
  const isPayment = /invoice|client|payment|owed|unpaid|freelance/.test(text);

  if (isTenancy) {
    return {
      disputeType: "Tenancy dispute",
      urgency: "medium",
      summary:
        "This looks like a disagreement between a tenant and landlord, most likely involving a security deposit or lease terms.",
      possibleADRPaths: [
        "Direct negotiation with the landlord",
        "Mediation through MyRight",
      ],
      recommendedNextSteps: [
        "Gather your tenancy agreement and any move-out photos",
        "Request an itemized breakdown of any deductions in writing",
        "Consider requesting mediation if direct talks stall",
      ],
      missingInformation: [
        "Whether the tenancy agreement specifies a deposit return timeline",
        "Whether a move-out inspection took place",
      ],
      sources: [
        { title: "MyRight ADR Guide: Tenancy Disputes", note: "General guidance on deposit disputes" },
      ],
    };
  }

  if (isPayment) {
    return {
      disputeType: "Contract / payment dispute",
      urgency: "medium",
      summary:
        "This looks like a payment dispute between a service provider and client, likely involving a contract or agreed deliverables.",
      possibleADRPaths: [
        "Send a formal payment reminder with a deadline",
        "Mediation through MyRight",
      ],
      recommendedNextSteps: [
        "Upload the signed contract or agreement",
        "Upload any written approval of the final work",
        "Send a written demand for payment before requesting mediation",
      ],
      missingInformation: [
        "Whether there's a written contract specifying payment terms",
        "Whether the client has disputed the quality of the work",
      ],
      sources: [
        { title: "MyRight ADR Guide: Contract Disputes", note: "General guidance on unpaid invoices" },
      ],
    };
  }

  return {
    disputeType: "General dispute",
    urgency: "low",
    summary:
      "Based on what you've shared, we can help you explore your options, but a few more details will help us narrow this down.",
    possibleADRPaths: ["Direct negotiation", "Mediation through MyRight"],
    recommendedNextSteps: [
      "Add more detail about what happened and when",
      "Upload any documents or evidence you already have",
    ],
    missingInformation: [
      "What outcome you're hoping for",
      "Whether you've already tried to resolve this directly",
    ],
    sources: [],
  };
}

export async function sendChatMessage(
  history: { role: "user" | "assistant"; content: string }[],
  message: string
): Promise<{ content: string; sources?: string[] }> {
  await delay(900);
  // Canned, context-light reply for the mock. Real version will retrieve
  // relevant chunks (case facts + knowledge base) before generating this.
  return {
    content:
      "Thanks, I've noted that. Based on what you've told me so far, gathering any written communication about this (emails, texts, messages) will strengthen your case if this goes to mediation. Is there anything else about the situation you'd like to add?",
    sources: [],
  };
}
