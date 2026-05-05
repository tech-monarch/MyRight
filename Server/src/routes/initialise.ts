import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { geminiModel } from '../lib/gemini'
import { supabase } from '../lib/supabase'

const router = Router()

// POST /api/initialize/analyze
router.post('/analyze', requireAuth, async (req: AuthRequest, res: Response) => {
  const { description, category, location, fileUrls } = req.body

  if (!description || description.trim().length < 50) {
    res.status(400).json({ error: 'Description is required and should be at least 50 characters' })
    return
  }

  try {
    const locationData = location || null

    // Build file info string if any
    let fileInfo = ''
    if (fileUrls && Array.isArray(fileUrls) && fileUrls.length > 0) {
      fileInfo = `\nThe user has uploaded ${fileUrls.length} supporting document(s): ${fileUrls.join(', ')}`
    }

    const prompt = `You are MyRight AI — a Nigerian dispute resolution expert specializing in mediation, arbitration, and legal guidance. Your task is to analyze a user's dispute description and produce a concise, actionable mediation roadmap.

The user has provided the following information:
- Dispute category: ${category || 'Not specified'}
- Description: ${description}
${fileInfo}
${locationData ? `- User location: ${JSON.stringify(locationData)}` : ''}

You must return ONLY a valid JSON object with the following structure (no markdown, no extra text):

{
  "summary": "A one-sentence summary of the core issue.",
  "keyIssues": ["List of 2-4 main legal or factual issues identified."],
  "relevantLaws": ["Relevant Nigerian laws or regulations, e.g., 'Section 44 CFRN 1999', 'Land Use Act 1978'."],
  "ADRRecommendation": "Which ADR mechanism is most suitable (mediation, arbitration, negotiation, etc.) and why.",
  "nextSteps": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "urgencyLevel": "low/medium/high/critical",
  "estimatedDuration": "e.g., '2-4 weeks for mediation'",
  "riskNotes": "Brief note on potential risks if not resolved quickly.",
  "localResources": "If location provided, suggest nearest legal aid or ADR centre; otherwise null."
}

Guidelines:
- Be professional, clear, and practical. Focus on Nigerian legal framework.
- For common categories (landlord/tenant, employment, contract, etc.), include specific legal references (e.g., Lagos Tenancy Law, Labour Act, Arbitration and Conciliation Act).
- Keep the response brief: total under 500 words.
- Urgency: "critical" only if physical danger or imminent loss; "high" if time-sensitive financial/legal consequences; "medium" for active dispute; "low" for early-stage issues.
- If location is provided, use it to recommend nearby ADR centres (e.g., Lagos Multi-Door Courthouse, Abuja Multi-Door Courthouse, Kano State Multi-Door Court, Enugu Multi-Door Court).
- Do not ask for more information; work with what's given.
- If the description mentions violence or police, escalate urgency and include safety tips.

Return ONLY the JSON object. No explanations before or after.`

    const result = await geminiModel.generateContent(prompt)
    const raw = result.response.text().trim()
    const jsonMatch = raw.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      console.error('No JSON found in Gemini response:', raw)
      // Fallback response
      const fallback = {
        summary: "Unable to analyze properly. Please provide more details.",
        keyIssues: ["Incomplete description"],
        relevantLaws: [],
        ADRRecommendation: "Please rephrase your dispute with more context.",
        nextSteps: ["Contact a legal adviser."],
        urgencyLevel: "low",
        estimatedDuration: "N/A",
        riskNotes: "Insufficient information to assess risk.",
        localResources: null
      }
      res.json(fallback)
      return
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Ensure all fields exist
    const responseData = {
      summary: parsed.summary || "Analysis complete.",
      keyIssues: Array.isArray(parsed.keyIssues) ? parsed.keyIssues : [],
      relevantLaws: Array.isArray(parsed.relevantLaws) ? parsed.relevantLaws : [],
      ADRRecommendation: parsed.ADRRecommendation || "Consider mediation.",
      nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : ["Document your evidence", "Seek legal advice"],
      urgencyLevel: parsed.urgencyLevel || "low",
      estimatedDuration: parsed.estimatedDuration || "Varies",
      riskNotes: parsed.riskNotes || "No immediate risk detected.",
      localResources: parsed.localResources || null
    }

    // Optionally save analysis to database? Could store in a new table `dispute_analyses`
    // For now, just return.

    res.json(responseData)

  } catch (error: any) {
    console.error('Initialization analysis error:', error)
    res.status(500).json({ error: 'Failed to analyze dispute. Please try again.' })
  }
})

export default router