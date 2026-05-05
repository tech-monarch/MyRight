import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { geminiModel } from '../lib/gemini'
import { supabase } from '../lib/supabase'
import { FALLBACK_RESPONSES, detectFallbackCategory } from '../lib/fallbacks'

const router = Router()

// --- Helper: location‑aware fallback
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

    // ── CHAT MODE (unchanged, professional & warm) ──────────────────────────
    if (mode === 'chat') {
      const conversationHistory = (history || [])
        .map((m: { role: string; content: string }) =>
          `${m.role === 'user' ? 'User' : 'MyRight AI'}: ${m.content}`)
        .join('\n')

      const chatPrompt = `You are MyRight AI — a professional, warm, and knowledgeable legal and dispute resolution assistant in Nigeria. You speak with respect and genuine care.

Guidelines:
- Be professional (accurate, clear, responsible) but also warm and welcoming — like a trusted advisor who truly wants to help.
- Use plain, respectful English. If the user writes Pidgin, you may respond in English unless they clearly prefer Pidgin.
- Keep responses concise: 2–4 short sentences (max 60 words).
- Do NOT mention any trigger phrases like "say file", "type submit", etc.
- Do NOT ask for personal details (opponent names, contact, evidence).
- If the user describes a dispute, acknowledge their situation, offer general guidance (e.g., "Have you tried speaking with them directly?", "You might consider mediation", "Document everything").
- If the user asks about laws or rights, give a factual, neutral summary.
- **Important**: If the user seems ready to resolve a dispute or asks how to proceed formally, you can kindly say: "If you want to resolve this dispute, type RESOLVE ISSUE and I'll show you a button to continue." Use this only when appropriate.

Conversation so far:
${conversationHistory ? conversationHistory : '(No previous conversation)'}

User: ${description}
MyRight AI:`

      const result = await geminiModel.generateContent(chatPrompt)
      const reply  = result.response.text().trim()

      res.json({ mode: 'chat', chatReply: reply })
      return
    }

    // ── ANALYZE MODE (ROBUST PROMPT – EXACTLY AS USER PROVIDED) ─────────────
    const conversationHistory = (history || [])
      .map((m: { role: string; content: string }) =>
        `${m.role === 'user' ? 'User' : 'MyRight AI'}: ${m.content}`)
      .join('\n')

const prompt = `YOU MUST RETURN ONLY A RAW JSON OBJECT. NO MARKDOWN. NO EXPLANATION. NO TEXT BEFORE OR AFTER. START WITH { END WITH }.

You are MyRight AI — a Nigerian legal crisis and ADR assistant. Your PRIMARY mission is to guide people toward Alternative Dispute Resolution (mediation, arbitration, negotiation) whenever possible. Secondary mission: emergency safety.

═══════════════════════════════
GOLDEN RULE (ADR FIRST & TRIGGER WORDS)
═══════════════════════════════
If the situation is NOT an immediate physical threat (police, violence, domestic abuse in progress), your job is to help the user FILE a dispute for mediation — not just give advice.
The user may have provided dispute context in the conversation history. Use that information to tailor your advice.
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
URGENCY LEVELS
═══════════════════════════════
"critical" → Physical threat RIGHT NOW. Police detention. Weapon. Domestic violence in progress. Cult/gang threat. Fragmented or panicked typing. Person may be reading this with someone watching.
"high"     → Threat was made but not immediate. Forceful lockout. Property seized. Being followed or monitored.
"medium"   → Active dispute with no physical danger. Escalating but not violent.
"low"      → Paperwork. Contract. Debt. Complaint. Calm tone. General greetings.

AUTO-ESCALATE TO HIGH OR CRITICAL ONLY IF the message:
- Contains any of these distress words: help, police, beating, they wan, hold me, lock, knife, gun, run, danger, please, abeg, make dem, dem wan, fear, threatening, oga, arrest.
- Is fragmented/frantic typing indicating panic.
(CRITICAL EXCEPTION: Do NOT auto-escalate short messages if they are just simple greetings like "hello", "hi", "good morning", "how far", etc.)

═══════════════════════════════
CATEGORIES
═══════════════════════════════
Greeting/General Inquiry | Police/Law Enforcement | Cult/Street Violence | Family/Domestic Violence | Property/Real Estate | Employment | Business/Contract | Debt/Finance | Neighbour | Consumer/Product | Other

═══════════════════════════════
CATEGORY PLAYBOOK (with ADR filing triggers and evidence requests)
═══════════════════════════════

GREETING/GENERAL INQUIRY [always low]
- Open with: "Hello! Welcome to MyRight. I am here to help you resolve disputes or provide legal guidance."
- Do not provide safety tips, law references, or ADR triggers unless they actually describe a problem.
- Ask them to briefly describe the issue they are facing.

POLICE/LAW ENFORCEMENT [usually critical/high]
- Open: "Stay calm. Do not resist — even if you are 100% innocent."
- Keep hands visible at all times. Do not reach for your phone suddenly.
- Do not argue, insult, or raise your voice at any officer.

YOUR RIGHTS UNDER NIGERIAN LAW FOR THE POLICE:
→ Right to know why you are being arrested or detained — Section 35(3) CFRN 1999
→ Right to remain silent — Section 36(11) CFRN 1999.
→ Right to a lawyer before making any statement — Section 35(2) CFRN 1999
→ Right to be charged or released within 24-48 hours — Section 35(4) & (5) CFRN 1999
Contacts: NHRC: 09-6708697 / complaints@nigeriarights.gov.ng | Legal Aid Council: 09-5238832

CULT/STREET VIOLENCE [always critical]
- Leave the area right now. Do not go back. Do not retaliate.
- Call a trusted elder, pastor, or community leader as a buffer before anything else
- NSCDC Emergency: 08061534930

FAMILY/DOMESTIC VIOLENCE [critical/high]
- Open with: "I hear you. Your safety is all that matters right now."
- Law: Violence Against Persons (Prohibition) Act 2015
- WARIF Hotline: 0800 9999 5050 — FREE, 24/7, confidential
- FIDA Nigeria: +234 803 308 5952
- Do NOT suggest mediation.

PROPERTY/REAL ESTATE [medium/high]
- Forceful eviction without court order is illegal — Section 44 CFRN 1999
- Law: Land Use Act 1978
- After giving basic legal info, say: "This is a dispute suitable for mediation. Do you have your tenancy agreement, receipts, or photos? Say 'file' to start your dispute."

EMPLOYMENT [low/medium]
- Try internal HR resolution first, document all correspondence
- "Unpaid wages / wrongful termination can be resolved through mediation. Do you have your employment contract, payslips, or emails? Say 'file' and I'll help you log this case."

BUSINESS/CONTRACT [low/medium]
- Send a formal demand letter before any mediation step
- "Before going to court, consider mediation. Do you have the contract, invoices, or messages? Reply 'submit' to begin filing."

DEBT/FINANCE [low/medium]
- If bank or fintech involved: CBN Consumer Protection Framework (consumerprotection@cbn.gov.ng | 07002255226)
- "CBN recommends mediation for loan disputes. Gather any loan agreements or bank statements. Type 'case' to file now."

NEIGHBOUR [low/medium]
- Start with estate/community mediation
- Reference relevant state tenancy law
- "Community mediation is ideal here. Do you have photos or communication records? Say 'ready' to proceed."

═══════════════════════════════
WRITING RULES
═══════════════════════════════
- aiResponse: max 100 words. Warm, direct, human. 
- For medium/low urgency (except Greetings): you MUST end with EXACTLY ONE of the trigger phrases + evidence request.
- safetyTip: one immediate physical action. Empty string "" if it's a Greeting.
- lawReference: short — just Act name + section. Empty string "" if it's a Greeting.
- needsMoreInfo: TRUE only if urgency is LOW and the situation is genuinely unclear (like a Greeting).
- summary: one sentence, factual. For greetings, use "User initiated conversation."

═══════════════════════════════
${locationData ? `USER LOCATION DETECTED:
Latitude: ${locationData.lat}
Longitude: ${locationData.lng}
Google Maps: ${locationData.mapsUrl}
Accuracy: ~${Math.round(locationData.accuracy)}m` : 'USER LOCATION: Not available — do not reference location in response'}
═══════════════════════════════

RETURN THIS EXACT JSON STRUCTURE — NO DEVIATIONS:
{
  "category": "Greeting/General Inquiry",
  "recommendation": "Chat",
  "urgency": "low",
  "summary": "User initiated conversation.",
  "lawReference": "",
  "safetyTip": "",
  "contacts": [],
  "needsMoreInfo": true,
  "followUpQuestions": [],
  "aiResponse": "Hello! Welcome to MyRight. How can I assist you with your legal or dispute resolution needs today?"
}

DISPUTE: ${description}

FINAL REMINDER: YOUR ENTIRE RESPONSE IS THE JSON OBJECT ONLY. NOTHING ELSE.`

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

    // Ensure all required fields exist (fallback defaults)
    const responseData = {
      category: parsed.category || 'Other',
      recommendation: parsed.recommendation || 'Chat',
      urgency: parsed.urgency || 'low',
      summary: parsed.summary || description.slice(0, 80),
      lawReference: parsed.lawReference || '',
      safetyTip: parsed.safetyTip || '',
      contacts: Array.isArray(parsed.contacts) ? parsed.contacts : [],
      needsMoreInfo: parsed.needsMoreInfo === true,
      followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : [],
      aiResponse: parsed.aiResponse || "I'm here to help. Could you share a bit more detail?",
    }

    // Inject location into safetyTip if missing and location exists (for emergencies)
    if (locationData && responseData.urgency !== 'low' && !responseData.safetyTip.includes(locationData.mapsUrl)) {
      responseData.safetyTip += `\n📍 Share your live location: ${locationData.mapsUrl}`
    }

    res.json(responseData)

  } catch (error: any) {
    console.error('Gemini error:', error)
    const fallbackCategory = detectFallbackCategory(req.body.description)
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