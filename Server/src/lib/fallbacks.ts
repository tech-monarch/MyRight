// Used when Gemini is down or returns invalid response

export const FALLBACK_RESPONSES: Record<string, {
  aiResponse: string
  contacts: { name: string; phone: string; email?: string }[]
  lawReference: string
  safetyTip: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
}> = {
  police: {
    urgency: 'critical',
    aiResponse: "Stay calm, don't resist — even if innocent. Keep hands visible. You have the right to know why you're held (Section 35 CFRN 1999) and the right to remain silent. Call NHRC now.",
    lawReference: 'Section 35 CFRN 1999 — Right to Personal Liberty',
    safetyTip: 'Do not reach for your phone suddenly. Memorise the badge number or vehicle plate.',
    contacts: [
      { name: 'NHRC', phone: '09-6708697', email: 'complaints@nigeriarights.gov.ng' },
      { name: 'SERAP', phone: '', email: 'info@serapnigeria.org' },
      { name: 'Legal Aid Council', phone: '09-5238832' },
    ],
  },
  violence: {
    urgency: 'critical',
    aiResponse: "Leave the area immediately. Do not retaliate. Go somewhere public — a church, mosque, or family member's home. Call NSCDC.",
    lawReference: 'Section 33 CFRN 1999 — Right to Life',
    safetyTip: 'Do not go home alone tonight.',
    contacts: [
      { name: 'NSCDC Emergency', phone: '08061534930' },
    ],
  },
  domestic: {
    urgency: 'critical',
    aiResponse: "I hear you. Your safety is all that matters. Leave quietly if you can — take children and ID. Do not warn the abuser. Call WARIF now, they are free and confidential.",
    lawReference: 'Violence Against Persons (Prohibition) Act 2015',
    safetyTip: 'Go to a trusted neighbour, family member, or public place immediately.',
    contacts: [
      { name: 'WARIF Hotline', phone: '0800 9999 5050' },
      { name: 'FIDA Nigeria', phone: '+234 803 308 5952' },
    ],
  },
  property: {
    urgency: 'medium',
    aiResponse: "Forceful eviction without a court order is illegal under Section 44 CFRN. Document everything — photos, witnesses, dates. Contact the NBA ADR Centre or Lagos Multi-Door Courthouse to begin mediation.",
    lawReference: 'Land Use Act 1978 + Section 44 CFRN 1999',
    safetyTip: 'Do not leave your property voluntarily until you have legal advice.',
    contacts: [
      { name: 'Lagos Multi-Door Courthouse', phone: '+234 1 454 2311' },
    ],
  },
  employment: {
    urgency: 'low',
    aiResponse: "Document all correspondence with your employer. If wages are unpaid, that's a violation of Section 7 of the Labour Act. File a complaint with the National Industrial Court if HR fails to resolve it.",
    lawReference: 'Labour Act Cap L1 LFN 2004 — Section 7',
    safetyTip: 'Keep copies of your employment contract, payslips, and all written communication.',
    contacts: [
      { name: 'National Industrial Court', phone: '09-6708697' },
    ],
  },
  contract: {
    urgency: 'low',
    aiResponse: "Send a formal demand letter first — it shows good faith and is often enough. If ignored, the Lagos Multi-Door Courthouse can mediate under the Arbitration and Conciliation Act.",
    lawReference: 'Arbitration and Conciliation Act Cap A18 LFN 2004',
    safetyTip: 'Keep all written agreements, receipts, and correspondence as evidence.',
    contacts: [
      { name: 'Lagos Multi-Door Courthouse', phone: '+234 1 454 2311' },
    ],
  },
  debt: {
    urgency: 'low',
    aiResponse: "If a bank is involved, file a complaint with the CBN Consumer Protection Department. For personal debts, a written repayment agreement through mediation is the fastest resolution.",
    lawReference: 'CBN Consumer Protection Framework 2016',
    safetyTip: 'Do not make any verbal agreements — get everything in writing.',
    contacts: [
      { name: 'CBN Consumer Protection', phone: '07002255226', email: 'consumerprotection@cbn.gov.ng' },
    ],
  },
  default: {
    urgency: 'low',
    aiResponse: "Our AI guide is temporarily unavailable, but we're here to help. Describe your situation and we'll connect you with the right resources. For emergencies, call NHRC: 09-6708697.",
    lawReference: '',
    safetyTip: 'Document everything related to your situation — dates, names, and any evidence.',
    contacts: [
      { name: 'NHRC', phone: '09-6708697', email: 'complaints@nigeriarights.gov.ng' },
    ],
  },
}

export const detectFallbackCategory = (text: string) => {
  const lower = text.toLowerCase()
  if (/police|officer|arrest|detained|checkpoint|sars/.test(lower)) return 'police'
  if (/cult|gang|street|violence|weapon|knife|gun|attack/.test(lower))  return 'violence'
  if (/husband|wife|partner|domestic|beating|abuse|spouse/.test(lower)) return 'domestic'
  if (/land|property|evict|landlord|tenant|house|rent/.test(lower))     return 'property'
  if (/employer|salary|wage|fired|job|work|oga/.test(lower))            return 'employment'
  if (/contract|agreement|business|deal|payment/.test(lower))           return 'contract'
  if (/debt|loan|borrow|money|bank|fintech/.test(lower))                return 'debt'
  return 'default'
}