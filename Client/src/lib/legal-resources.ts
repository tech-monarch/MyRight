/**
 * Legal Resources: DEMONSTRATION catalogue.
 *
 * Everything in this file is illustrative. The listings, prices and sample
 * wording exist to show what a MyRight resources marketplace could look like.
 * They are NOT:
 *   - documents that currently exist or are available for sale,
 *   - reviewed by a lawyer or suitable for legal use,
 *   - validated prices.
 * There are deliberately no reviews, ratings, purchase counts, testimonials
 * or revenue figures anywhere in this catalogue.
 *
 * There is no backend for this yet. See docs/LEGAL_RESOURCES_MARKETPLACE_ROADMAP.md
 * for what replacing this file with a real resource service involves.
 */

export type ResourceCategoryId =
  | "business-contracts"
  | "employment-hr"
  | "tenancy-property"
  | "sales-service"
  | "nda"
  | "freelance"
  | "debt-recovery"
  | "business-policies"
  | "guides-checklists";

export interface ResourceCategory {
  id: ResourceCategoryId;
  label: string;
  blurb: string;
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  { id: "business-contracts", label: "Business Contracts", blurb: "Agreements for running and growing a business." },
  { id: "employment-hr", label: "Employment & HR", blurb: "Hiring, onboarding and workplace paperwork." },
  { id: "tenancy-property", label: "Tenancy & Property", blurb: "Renting and letting, documented clearly." },
  { id: "sales-service", label: "Sales & Service Agreements", blurb: "Terms for supplying goods and services." },
  { id: "nda", label: "Non-Disclosure Agreements", blurb: "Keep shared information confidential." },
  { id: "freelance", label: "Freelance & Consultancy", blurb: "Agreements for independent work." },
  { id: "debt-recovery", label: "Debt Recovery", blurb: "Formal steps for unpaid amounts." },
  { id: "business-policies", label: "Business Policies", blurb: "Written policies for a small team." },
  { id: "guides-checklists", label: "Guides & Checklists", blurb: "Plain-English explainers and checklists." },
];

export type ResourceKind = "Template" | "Pack" | "Bundle" | "Guide" | "Checklist";

/** How the generated illustrative cover is drawn (see ResourceCover). */
export interface CoverStyle {
  motif: "sheet" | "stack" | "letter" | "checklist" | "bundle" | "guide";
  tone: "blue" | "navy" | "green" | "amber" | "slate";
  icon:
    | "FileSignature"
    | "Lock"
    | "Briefcase"
    | "Home"
    | "Handshake"
    | "Mail"
    | "Users"
    | "Layers"
    | "ClipboardList"
    | "BookOpen"
    | "ScrollText";
}

export interface LegalResource {
  slug: string;
  title: string;
  /** One or two sentences for cards. */
  summary: string;
  category: ResourceCategoryId;
  kind: ResourceKind;
  /** Whole naira. 0 means a free example resource. */
  priceNgn: number;
  /** What the delivered file(s) would be. Nothing is delivered today. */
  format: string;
  featured: boolean;
  description: string;
  audience: string[];
  includes: string[];
  excerpt: { heading: string; clauses: { title: string; text: string }[] };
  /** Plain statements of intended use and what this is not. */
  limitations: string[];
  cover: CoverStyle;
}

export const LEGAL_RESOURCES: LegalResource[] = [
  {
    slug: "business-contract-pack",
    title: "Business Contract Pack",
    summary: "A starter set of the agreements most small businesses reach for first, in one organised download.",
    category: "business-contracts",
    kind: "Pack",
    priceNgn: 18500,
    format: "Editable DOCX + PDF copies",
    featured: true,
    description:
      "A practical collection of core business agreements, written in plain English and laid out so you can see what each clause is for. Designed as a starting point to adapt to your own arrangement, with short notes beside the key clauses explaining what they do and what to decide before you sign.",
    audience: ["Small business owners formalising how they trade", "Startups preparing their first customer and supplier agreements", "Anyone tired of agreeing terms over WhatsApp alone"],
    includes: [
      "General services agreement",
      "Supply of goods agreement",
      "Simple partnership / collaboration agreement",
      "Statement of work add-on",
      "Variation and termination notice templates",
      "Clause-by-clause guidance notes",
    ],
    excerpt: {
      heading: "Services Agreement: sample wording",
      clauses: [
        { title: "1. The services", text: "The Provider will carry out the services described in the attached Schedule, using reasonable skill and care, and will tell the Client promptly if anything is likely to delay them." },
        { title: "2. Payment", text: "The Client will pay each invoice within the number of days stated in the Schedule. Work on a milestone starts once its deposit is received." },
        { title: "3. Ending the agreement", text: "Either party may end this agreement by giving written notice. Amounts earned for work already done remain payable." },
      ],
    },
    limitations: [
      "A starting point to adapt, not a finished document for every situation.",
      "Does not replace advice from a qualified lawyer, especially for high-value or unusual arrangements.",
      "Contract rules and formalities can differ by transaction and location; check what applies to yours.",
    ],
    cover: { motif: "stack", tone: "navy", icon: "Briefcase" },
  },
  {
    slug: "non-disclosure-agreement-template",
    title: "Non-Disclosure Agreement Template",
    summary: "A clear, balanced NDA for sharing business information safely, with a mutual and a one-way version.",
    category: "nda",
    kind: "Template",
    priceNgn: 3500,
    format: "Editable DOCX + PDF",
    featured: true,
    description:
      "Before you share a business plan, customer list or product idea, put the ground rules in writing. This template covers what counts as confidential, how it may be used, how long the duty lasts and what happens when the relationship ends. Includes both a mutual and a one-way version.",
    audience: ["Founders sharing ideas with investors or partners", "Businesses talking to contractors or suppliers", "Freelancers handling a client's private information"],
    includes: ["Mutual NDA", "One-way NDA", "Definition of confidential information with examples", "Return-or-destroy information checklist", "Plain-English guidance notes"],
    excerpt: {
      heading: "Mutual NDA: sample wording",
      clauses: [
        { title: "1. What is confidential", text: "Confidential Information means any non-public information one party shares with the other for the Purpose, whether written, spoken or electronic." },
        { title: "2. How it may be used", text: "The receiving party will use Confidential Information only for the Purpose and will not share it except with people who need it and are bound to keep it private." },
      ],
    },
    limitations: [
      "An NDA is only as useful as it is specific; fill in the Purpose and parties carefully.",
      "Does not guarantee information stays private, and does not cover information that is already public.",
      "Not legal advice. Have a lawyer review it if the information is highly valuable.",
    ],
    cover: { motif: "sheet", tone: "blue", icon: "Lock" },
  },
  {
    slug: "freelancer-service-agreement",
    title: "Freelancer Service Agreement",
    summary: "Agree scope, payment and ownership of the work up front, so the project stays on track.",
    category: "freelance",
    kind: "Template",
    priceNgn: 5000,
    format: "Editable DOCX + PDF",
    featured: true,
    description:
      "A straightforward agreement between a freelancer or consultant and a client. It covers what is being delivered, when and how payment happens, revisions, who owns the finished work and what happens if the project stops early. Written to prevent the most common freelance disputes before they start.",
    audience: ["Freelancers and consultants", "Businesses hiring independent contractors", "Agencies working with sub-contractors"],
    includes: ["Service agreement", "Project scope and milestone schedule", "Payment and deposit terms", "Revision and change-request clause", "Ownership of work clause"],
    excerpt: {
      heading: "Freelancer Agreement: sample wording",
      clauses: [
        { title: "1. Scope and milestones", text: "The Freelancer will deliver the work listed in the Scope Schedule by the dates shown. Work outside the Schedule is a change request and is priced separately." },
        { title: "2. Ownership", text: "Once the Freelancer has been paid in full, the finished work belongs to the Client. Until then the Freelancer keeps ownership." },
      ],
    },
    limitations: [
      "Whether someone is a contractor or an employee depends on the real working relationship, not only the paperwork.",
      "Does not replace tax, employment or legal advice.",
      "Review the ownership and payment terms to make sure they match what you actually agreed.",
    ],
    cover: { motif: "sheet", tone: "green", icon: "Handshake" },
  },
  {
    slug: "tenancy-documentation-pack",
    title: "Tenancy Documentation Pack",
    summary: "The paperwork for a rental, from agreement to inventory to notices, organised in one place.",
    category: "tenancy-property",
    kind: "Pack",
    priceNgn: 12000,
    format: "Editable DOCX + PDF copies",
    featured: true,
    description:
      "Clear records are the best protection for both landlords and tenants. This pack brings together the documents used across a tenancy: the agreement, a condition and inventory record, rent receipts and the notices commonly needed along the way. Includes guidance on what to record at move-in.",
    audience: ["Landlords and property managers letting residential property", "Tenants who want a clear written record", "Small agents managing several lets"],
    includes: ["Residential tenancy agreement", "Move-in condition and inventory record", "Rent receipt template", "Notice templates (general)", "Deposit and handover checklist"],
    excerpt: {
      heading: "Tenancy Agreement: sample wording",
      clauses: [
        { title: "1. Rent", text: "The Tenant will pay the rent stated in the Schedule on the dates shown there and will be given a receipt for each payment." },
        { title: "2. Condition of the property", text: "The parties will sign the attached condition record at move-in. It is the reference point for any later question about damage." },
      ],
    },
    limitations: [
      "Tenancy rules, notice periods and deposit rules differ by state and by type of property. Check the rules that apply where the property is.",
      "Not a substitute for advice on a specific tenancy dispute.",
      "Templates are general; adapt them to your arrangement.",
    ],
    cover: { motif: "stack", tone: "amber", icon: "Home" },
  },
  {
    slug: "sales-and-supply-agreement",
    title: "Sales and Supply Agreement",
    summary: "Set terms for goods: price, delivery, risk, payment and what happens when something goes wrong.",
    category: "sales-service",
    kind: "Template",
    priceNgn: 9500,
    format: "Editable DOCX + PDF",
    featured: false,
    description:
      "For businesses that sell or supply goods on a repeat basis. It sets out what is being sold, how pricing and delivery work, when ownership passes, how defects and returns are handled and how disagreements are dealt with, so each order does not need to be renegotiated from scratch.",
    audience: ["Wholesalers and distributors", "Manufacturers supplying retailers", "Businesses buying regularly from the same supplier"],
    includes: ["Sales and supply agreement", "Order form template", "Delivery and acceptance record", "Defects and returns clause", "Late payment clause"],
    excerpt: {
      heading: "Supply Agreement: sample wording",
      clauses: [
        { title: "1. Orders and delivery", text: "Each order is made on the Order Form. The Supplier will deliver to the address on the Order Form and the Buyer will inspect the goods promptly on arrival." },
        { title: "2. Defects", text: "If goods are defective or not as described, the Buyer must tell the Supplier within the period stated, and the Supplier will repair, replace or refund." },
      ],
    },
    limitations: [
      "Sale-of-goods and consumer rules may apply and cannot always be changed by agreement.",
      "General template: adjust price, delivery and risk terms to your trade.",
      "Not legal advice.",
    ],
    cover: { motif: "sheet", tone: "slate", icon: "Layers" },
  },
  {
    slug: "demand-letter-template",
    title: "Demand Letter Template",
    summary: "A firm, professional letter asking for payment, with guidance on what to include and what to keep.",
    category: "debt-recovery",
    kind: "Template",
    priceNgn: 4500,
    format: "Editable DOCX + PDF",
    featured: true,
    description:
      "When an amount is overdue, a clear written demand is often the right first step. This template helps you state what is owed, why, and by when, in a calm and professional tone, and includes a checklist of the records worth keeping in case the matter is not resolved.",
    audience: ["Businesses chasing unpaid invoices", "Individuals owed money under an agreement", "Anyone preparing to start a dispute process"],
    includes: ["Demand letter", "Follow-up reminder letter", "Record-keeping checklist", "Guidance on tone and what to avoid"],
    excerpt: {
      heading: "Demand Letter: sample wording",
      clauses: [
        { title: "Amount owed", text: "Our records show that the sum of the amount stated in the attached statement remains unpaid under the agreement dated as shown." },
        { title: "Next step", text: "Please pay the amount by the date stated. If you believe the amount is wrong, tell us in writing before that date and explain why." },
      ],
    },
    limitations: [
      "A letter does not by itself create a legal claim or guarantee payment.",
      "Rules on interest, limitation periods and further steps vary; get advice before escalating.",
      "Keep the tone factual: do not make threats you do not intend or are not entitled to carry out.",
    ],
    cover: { motif: "letter", tone: "navy", icon: "Mail" },
  },
  {
    slug: "employee-onboarding-document-pack",
    title: "Employee Onboarding Document Pack",
    summary: "The documents for bringing a new hire on board, from offer to first-week checklist.",
    category: "employment-hr",
    kind: "Pack",
    priceNgn: 15000,
    format: "Editable DOCX + PDF copies",
    featured: true,
    description:
      "A tidy set of documents for a new hire's first weeks. It helps a small business put the basics in writing: the offer, key terms of employment, the policies the new hire needs to know and an onboarding checklist so nothing is forgotten.",
    audience: ["Small business owners hiring their first employees", "HR officers in growing teams", "Startups formalising how they onboard"],
    includes: ["Offer letter template", "Core terms of employment summary", "Probation review template", "New-hire first-week checklist", "Acknowledgement of policies form"],
    excerpt: {
      heading: "Offer Letter: sample wording",
      clauses: [
        { title: "The role", text: "We are pleased to offer you the role stated below, reporting to the person named, starting on the date shown, subject to the conditions listed." },
        { title: "Probation", text: "The first months of employment are a probation period. We will review how things are going with you before it ends." },
      ],
    },
    limitations: [
      "Employment terms and statutory entitlements cannot always be varied by agreement; check what applies.",
      "General templates: adapt them to the role and to your business.",
      "Not legal or HR advice.",
    ],
    cover: { motif: "stack", tone: "blue", icon: "Users" },
  },
  {
    slug: "small-business-legal-essentials-bundle",
    title: "Small Business Legal Essentials Bundle",
    summary: "Our contract, NDA, freelancer, demand letter and policy resources together, at a bundled price.",
    category: "business-contracts",
    kind: "Bundle",
    priceNgn: 35000,
    format: "Editable DOCX + PDF copies",
    featured: true,
    description:
      "Everything a young business tends to need in its first year, gathered as one bundle: core business agreements, a confidentiality agreement, a freelancer agreement, a demand letter and a starter set of workplace policies. Priced below buying each separately, as an illustration of how bundles could work on MyRight.",
    audience: ["New businesses getting their paperwork in order", "Founders who want one consistent set of documents", "Small teams starting to hire"],
    includes: ["Business Contract Pack", "Non-Disclosure Agreement Template", "Freelancer Service Agreement", "Demand Letter Template", "Workplace Policies Starter Set", "A short guide to which document to use when"],
    excerpt: {
      heading: "Choosing a document: sample guide",
      clauses: [
        { title: "Sharing an idea?", text: "Start with the NDA before you go into detail with someone you do not yet have an agreement with." },
        { title: "Hiring someone for a project?", text: "Use the freelancer agreement for independent work, and the onboarding pack when you are hiring an employee." },
      ],
    },
    limitations: [
      "A bundle of general templates; none are tailored to your specific circumstances.",
      "Not legal advice. Get a lawyer's review for anything high-value or unusual.",
      "Illustrative bundle price only.",
    ],
    cover: { motif: "bundle", tone: "navy", icon: "Layers" },
  },
  {
    slug: "workplace-policies-starter-set",
    title: "Workplace Policies Starter Set",
    summary: "Short, readable policies a small team can adopt and actually follow.",
    category: "business-policies",
    kind: "Pack",
    priceNgn: 8500,
    format: "Editable DOCX + PDF copies",
    featured: false,
    description:
      "Written policies set expectations and make hard conversations easier. This starter set covers the policies small teams most often need, written in plain language so that people read them. Each includes a short note on when to review it.",
    audience: ["Small business owners", "Office managers and HR officers", "Teams writing their first staff handbook"],
    includes: ["Code of conduct", "Leave and attendance policy", "Confidentiality and data-handling policy", "Anti-harassment policy", "Complaints and grievance procedure"],
    excerpt: {
      heading: "Grievance Procedure: sample wording",
      clauses: [
        { title: "Raising a concern", text: "If you have a concern about how you have been treated at work, tell your manager or the person named in this policy, in writing if you can." },
        { title: "What happens next", text: "We will acknowledge your concern, look into it fairly and tell you the outcome." },
      ],
    },
    limitations: [
      "Policies must reflect how your workplace really operates, and be applied consistently.",
      "General starting point: not legal or HR advice.",
      "Check requirements that apply to your sector and size.",
    ],
    cover: { motif: "stack", tone: "slate", icon: "ScrollText" },
  },
  {
    slug: "tenant-pre-signing-checklist",
    title: "Tenant's Pre-Signing Checklist",
    summary: "A free checklist of what to check and ask before you sign a tenancy agreement.",
    category: "guides-checklists",
    kind: "Checklist",
    priceNgn: 0,
    format: "PDF",
    featured: false,
    description:
      "Before signing a tenancy agreement, run through this one-page checklist. It prompts you to check who you are renting from, what you are paying for, what the agreement says about repairs and notice, and what to record at move-in. A free example of the kind of resource MyRight could offer.",
    audience: ["First-time renters", "Anyone about to sign a tenancy agreement", "Families helping someone find a place to rent"],
    includes: ["One-page checklist", "Questions to ask the landlord or agent", "What to photograph at move-in"],
    excerpt: {
      heading: "Checklist: sample items",
      clauses: [
        { title: "Who am I renting from?", text: "Do you know who the owner or authorised agent is, and have you seen something that shows it?" },
        { title: "What am I paying for?", text: "Is every amount written down: rent, deposit, agent fees, service charges, and when each is due?" },
      ],
    },
    limitations: [
      "A prompt to think and ask questions, not legal advice.",
      "Rules differ by state and property; check what applies where you are renting.",
    ],
    cover: { motif: "checklist", tone: "green", icon: "ClipboardList" },
  },
  {
    slug: "understanding-mediation-guide",
    title: "Understanding Mediation: A Plain-English Guide",
    summary: "A free guide to what mediation is, how it works and when it can help you settle a dispute.",
    category: "guides-checklists",
    kind: "Guide",
    priceNgn: 0,
    format: "PDF",
    featured: false,
    description:
      "Mediation is often faster, cheaper and less stressful than going to court. This short guide explains how mediation works, what a mediator does, how to prepare and what a typical agreement looks like. It connects directly to how MyRight helps people resolve disputes.",
    audience: ["Anyone considering mediation for a dispute", "People invited to take part in a mediation", "Small business owners handling a customer or supplier disagreement"],
    includes: ["What mediation is and is not", "How a session usually runs", "How to prepare", "What a settlement agreement should say"],
    excerpt: {
      heading: "Guide: sample extract",
      clauses: [
        { title: "What does a mediator do?", text: "A mediator is neutral. They do not decide who is right. They help both sides talk, understand each other and look for an outcome they can both accept." },
        { title: "Is it binding?", text: "A mediation is voluntary. If both sides reach an agreement and sign it, that agreement can be relied on; if not, you are free to explore other options." },
      ],
    },
    limitations: [
      "General information only, not legal advice.",
      "Mediation may not suit every dispute, for example where urgent court orders are needed.",
    ],
    cover: { motif: "guide", tone: "blue", icon: "BookOpen" },
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** "₦18,500". Formatted by hand so the server and browser always agree. */
export function formatNaira(amount: number): string {
  return `\u20a6${amount.toLocaleString("en-US")}`;
}

export function isFree(r: LegalResource): boolean {
  return r.priceNgn === 0;
}

export function getCategory(id: ResourceCategoryId): ResourceCategory {
  return RESOURCE_CATEGORIES.find((c) => c.id === id)!;
}

export function getResource(slug: string): LegalResource | undefined {
  return LEGAL_RESOURCES.find((r) => r.slug === slug);
}

export function featuredResources(): LegalResource[] {
  return LEGAL_RESOURCES.filter((r) => r.featured);
}

/** The label on a card's call to action. */
export function ctaLabel(r: LegalResource): string {
  if (isFree(r)) return r.kind === "Guide" ? "Get free guide" : "Get free checklist";
  return r.kind === "Template" ? "Get template" : "View resource";
}

export type SortKey = "featured" | "price-asc" | "price-desc" | "title";
export type PriceFilter = "all" | "free" | "paid";

export interface ResourceFilters {
  query: string;
  category: ResourceCategoryId | "all";
  price: PriceFilter;
  sort: SortKey;
}

export function isValidCategory(value: string | undefined): value is ResourceCategoryId {
  return RESOURCE_CATEGORIES.some((c) => c.id === value);
}

/** Lowercase alphanumeric words: "Non-Disclosure Agreements" -> ["non", "disclosure", "agreements"]. */
function words(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

/**
 * Pure, so it can be tested without rendering anything.
 *
 * Search matches the START of words, not any substring. Substring matching
 * made "nda" find "atteNDAnce", so a search for "NDA" returned a workplace
 * policy. With word-start matching, "agree" still finds "agreement" and
 * "check" still finds "checklists", but "nda" only finds NDAs.
 */
export function filterResources(items: LegalResource[], f: ResourceFilters): LegalResource[] {
  const queryWords = words(f.query);
  const out = items.filter((r) => {
    if (f.category !== "all" && r.category !== f.category) return false;
    if (f.price === "free" && !isFree(r)) return false;
    if (f.price === "paid" && isFree(r)) return false;
    if (queryWords.length === 0) return true;
    const haystack = words([r.title, r.summary, r.description, getCategory(r.category).label, r.kind, ...r.includes].join(" "));
    // Every word typed must start some word in the listing, in any order.
    return queryWords.every((q) => haystack.some((h) => h.startsWith(q)));
  });

  const sorted = [...out];
  if (f.sort === "price-asc") sorted.sort((a, b) => a.priceNgn - b.priceNgn || a.title.localeCompare(b.title));
  else if (f.sort === "price-desc") sorted.sort((a, b) => b.priceNgn - a.priceNgn || a.title.localeCompare(b.title));
  else if (f.sort === "title") sorted.sort((a, b) => a.title.localeCompare(b.title));
  // "featured" keeps catalogue order, which is already curated.
  return sorted;
}

/** Other listings to suggest on a detail page: same category first, then the rest. */
export function relatedResources(r: LegalResource, count = 3): LegalResource[] {
  const others = LEGAL_RESOURCES.filter((x) => x.slug !== r.slug);
  const same = others.filter((x) => x.category === r.category);
  const rest = others.filter((x) => x.category !== r.category);
  return [...same, ...rest].slice(0, count);
}

export const DEMO_NOTICE =
  "Demonstration catalogue: these listings, prices and previews are illustrative and not yet available to buy. Nothing here has been reviewed by a lawyer.";
