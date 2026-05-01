import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { geminiModel } from '../lib/gemini'
import { supabase } from '../lib/supabase'
import { FALLBACK_RESPONSES, detectFallbackCategory } from '../lib/fallbacks'

const router = Router()

// --- Helper: location‑aware fallback (injects map link and local action hint)
function getLocalizedFallback(category: string, location?: { lat: number; lng: number; mapsUrl: string }) {
  const fallback = FALLBACK_RESPONSES[category] || FALLBACK_RESPONSES.default
  let response = fallback.aiResponse

  if (location) {
    response += `\n\n📍 Your current location: ${location.mapsUrl}. For local help, open that map and search "police station", "legal aid", or "ADR centre" near you — we strongly recommend starting with mediation if safe.`
  }
  return { ...fallback, aiResponse: response }
}

// POST /api/disputes/analyze
router.post('/analyze', requireAuth, async (req: AuthRequest, res: Response) => {
  const { description, location, mode, history } = req.body

  if (!description) {
    res.status(400).json({ error: 'Description is required' })
    return
  }

  try {
    const locationData = location || null

    // ── CHAT MODE ──────────────────────────────────────────────────────────────
    if (mode === 'chat') {
      const conversationHistory = (history || [])
        .map((m: { role: string; content: string }) =>
          `${m.role === 'user' ? 'User' : 'MyRight AI'}: ${m.content}`)
        .join('\n')

      const chatPrompt = `You are MyRight AI — a warm, smart Nigerian legal and dispute resolution assistant. You help people resolve conflicts, understand their rights, and navigate legal situations in Nigeria.

Have a natural conversation with the user. Listen carefully, ask follow-up questions if needed, and give practical advice. You know Nigerian law, culture, and context well. Use simple language. If the user uses Pidgin, feel free to respond naturally.

Keep responses concise — 1-3 short paragraphs max. Do not lecture. Be like a knowledgeable friend, not a textbook.

${conversationHistory ? `Conversation so far:\n${conversationHistory}\n` : ''}User: ${description}
MyRight AI:`

      const result = await geminiModel.generateContent(chatPrompt)
      const reply  = result.response.text().trim()

      res.json({ mode: 'chat', chatReply: reply })
      return
    }

    // ── ANALYZE MODE (UPDATED: NO QUESTIONS, DIRECT TO FORM) ───────────────────
    const prompt = `YOU MUST RETURN ONLY A RAW JSON OBJECT. NO MARKDOWN. NO EXPLANATION. NO TEXT BEFORE OR AFTER. START WITH { END WITH }.

You are MyRight AI — a Nigerian legal crisis and ADR assistant. Your PRIMARY mission is to guide people toward Alternative Dispute Resolution (mediation, arbitration, negotiation) whenever possible. Secondary mission: emergency safety.

═══════════════════════════════
GOLDEN RULE (DIRECT TO FORM – NO QUESTIONS)
═══════════════════════════════
If the situation is NOT an immediate physical threat (police, violence, domestic abuse in progress), your job is to help the user FILE a dispute for mediation — NOT to ask questions.
- DO NOT ask for more details, evidence, or clarification in the chat.
- The user will provide all details (description, evidence, opponent info) inside the dispute form that opens after they say the trigger word.
- Your aiResponse must be very short (max 40 words) and MUST end with ONE of these exact trigger phrases:
  * "Say 'file' to start your dispute."
  * "Type 'submit' when you're ready."
  * "Just say 'case' and I'll help you log it."
  * "Reply 'ready' to file now."
- Example of correct response: "I'm sorry that happened. ADR can help resolve this. Say 'file' to start your dispute and provide all details in the form."
- Example of WRONG response (DO NOT DO THIS): "Can you tell me more about how the scam occurred? Do you have any evidence?"

═══════════════════════════════
LOCATION PERSONALIZATION (CRITICAL)
═══════════════════════════════
You will receive a "location" object with lat, lng, and a Google Maps URL. USE IT to give local resources:
- Infer the city / state (using lat/lng). If unsure, use "your area".
- For police emergencies → provide the nearest DPO's phone number if you know it, otherwise say "call your local DPO – search on the map below".
- For ADR help → suggest the nearest Multi‑Door Courthouse (Lagos, Abuja, Kano, Enugu) based on location.
- For legal aid → suggest local office of Legal Aid Council or NHRC state office.

Always append the maps URL in safetyTip for high/critical urgency: "Share your location with someone you trust: [mapsUrl]"

═══════════════════════════════
URGENCY LEVELS (unchanged)
═══════════════════════════════
"critical" → Physical threat RIGHT NOW. Police detention. Weapon. Domestic violence in progress. Cult/gang threat. Fragmented or panicked typing.
"high"     → Threat was made but not immediate. Forceful lockout. Property seized.
"medium"   → Active dispute with no physical danger.
"low"      → Paperwork. Contract. Debt. Complaint. Calm tone.

AUTO-ESCALATE TO HIGH OR CRITICAL if the message:
- Is under 15 words
- Contains any of: help, police, beating, they wan, hold me, lock, knife, gun, run, danger, please, abeg, make dem, dem wan, fear, threatening, oga, arrest

═══════════════════════════════
CATEGORIES (unchanged)
═══════════════════════════════
Police/Law Enforcement | Cult/Street Violence | Family/Domestic Violence | Property/Real Estate | Employment | Business/Contract | Debt/Finance | Neighbour | Consumer/Product | Other

═══════════════════════════════
CATEGORY PLAYBOOK (NO QUESTIONS – ONLY FILING TRIGGER)
═══════════════════════════════

For ALL non‑emergency categories (Property, Employment, Business, Debt, Neighbour, Other):
- Acknowledge the user's situation briefly (one short sentence).
- State that ADR (mediation) is the right path.
- End with the trigger phrase + mention that they can provide all details in the form.
- DO NOT ask for any additional information.

Example for Property: "Forceful eviction is illegal. ADR can help resolve this without court. Say 'file' to start your dispute – you can describe everything and upload evidence in the form."

Example for Employment: "Unpaid wages are a violation of the Labour Act. Mediation is a fast solution. Type 'submit' when ready – include your contract and payslips in the form."

Example for Debt: "Loan disputes are best handled through mediation. Just say 'case' – you'll be able to give full details and upload documents."

Example for Neighbour: "Community mediation works well for neighbour issues. Reply 'ready' to file – tell us everything in the form."

For emergency categories (Police, Cult/Street Violence, Domestic Violence):
- Follow the original safety-first responses (no filing trigger, only safety instructions).
- Keep all existing legal rights, contacts, and safety tips unchanged.

═══════════════════════════════
WRITING RULES (UPDATED)
═══════════════════════════════
- aiResponse: MAXIMUM 40 WORDS for non‑emergency. Shorter is better.
- For non‑emergency: No questions, no requests for more info.
- safetyTip: For emergencies only – one immediate physical action. If location, include map link.
- lawReference: For emergencies only. For non‑emergency, can be very brief or omitted.
- contacts: For emergencies only. For non‑emergency, omit – the form will collect case details.
- summary: One short sentence.

═══════════════════════════════
RESPONSE LENGTH RULES
═══════════════════════════════
NON‑EMERGENCY (medium/low urgency): MAX 40 WORDS. Example: "Sorry about the dispute with your sister. Mediation can resolve family money issues privately. Say 'file' to start your dispute – describe everything in the form."

EMERGENCY (critical/high): Keep original 2-3 sentence safety response.

═══════════════════════════════
SPECIAL HANDLING (unchanged)
═══════════════════════════════
- If emergency: safety first, no ADR talk.
- Never ask questions for non‑emergency.

═══════════════════════════════
${locationData ? `USER LOCATION DETECTED:
Latitude: ${locationData.lat}
Longitude: ${locationData.lng}
Google Maps: ${locationData.mapsUrl}
Accuracy: ~${Math.round(locationData.accuracy)}m
→ For emergencies, include this map link in safetyTip.
→ For non‑emergency, you can mention local ADR centre (e.g., "Lagos Multi-Door Courthouse is near you") but still end with trigger phrase.` : 'USER LOCATION: Not available — do not reference location in response'}
═══════════════════════════════

RETURN THIS EXACT JSON STRUCTURE — NO DEVIATIONS:

FOR NON‑EMERGENCY (example):
{
  "category": "Business/Contract",
  "recommendation": "File Dispute",
  "urgency": "low",
  "summary": "User reports sister scammed 6 million naira and refuses to pay.",
  "lawReference": "",
  "safetyTip": "",
  "contacts": [],
  "needsMoreInfo": false,
  "followUpQuestions": [],
  "aiResponse": "Sorry about the money dispute with your sister. Mediation can help resolve family matters privately. Say 'file' to start your dispute – give all details in the form."
}

FOR EMERGENCY (example – keep your original structure unchanged):
{
  "category": "Police/Law Enforcement",
  "recommendation": "Immediate Safety",
  "urgency": "critical",
  "summary": "User reports police detention.",
  "lawReference": "Section 35 CFRN 1999",
  "safetyTip": "Stay calm, hands visible. Share your location: https://maps.google.com/...",
  "contacts": [{"name":"NHRC","phone":"09-6708697"}],
  "needsMoreInfo": false,
  "followUpQuestions": [],
  "aiResponse": "Stay calm, don't resist. You have the right to remain silent. Call NHRC now: 09-6708697."
}

DISPUTE: ${description}

FINAL REMINDER: FOR NON‑EMERGENCY, NO QUESTIONS – JUST ACKNOWLEDGE + TRIGGER PHRASE. MAX 40 WORDS.`

    const result    = await geminiModel.generateContent(prompt)
    const raw       = result.response.text().trim()
    const jsonMatch = raw.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      console.error('No JSON found in Gemini response:', raw)
      const fallbackCategory = detectFallbackCategory(description)
      const localized = getLocalizedFallback(fallbackCategory, locationData)
      res.json(localized)
      return
    }

    const parsed = JSON.parse(jsonMatch[0])
    // Inject location into safetyTip if missing and location exists (emergency only)
    if (locationData && parsed.urgency !== 'low' && !parsed.safetyTip.includes(locationData.mapsUrl)) {
      parsed.safetyTip += `\n📍 Share your live location: ${locationData.mapsUrl}`
    }
    res.json(parsed)

  } catch (error: any) {
    console.error('Gemini error:', error)
    const fallbackCategory = detectFallbackCategory(description)
    const localized = getLocalizedFallback(fallbackCategory, req.body.location)
    res.status(200).json(localized)
  }
})

// POST /api/disputes/submit (unchanged)
router.post('/submit', requireAuth, async (req: AuthRequest, res: Response) => {
  const { title, description, category, opponentName, opponentContact } = req.body

  if (!description || !opponentName || !opponentContact) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  try {
    const { data, error } = await supabase
      .from('cases')
      .insert({
        title:            title || `${category || 'General'} Dispute`,
        description,
        category:         category || 'Other',
        status:           'open',
        type:             'dispute',
        user_id:          req.user.id,
        opponent_name:    opponentName,
        opponent_contact: opponentContact,
      })
      .select()
      .single()

    if (error) throw error

    res.json({ success: true, case: data })

  } catch (error: any) {
    console.error('Supabase error:', error)
    res.status(500).json({ error: 'Failed to submit dispute' })
  }
})

// GET /api/disputes (unchanged)
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ cases: data })

  } catch (error: any) {
    console.error('Fetch disputes error:', error)
    res.status(500).json({ error: 'Failed to fetch disputes' })
  }
})

export default router