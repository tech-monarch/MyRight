# Legal Resources Marketplace: current scope and backend roadmap

**Status: frontend demonstration only.** Nothing here can sell, take payment, store a file or deliver a
document. Every listing, price and sample is illustrative content written for a pitch. No listing has been
reviewed by a lawyer, and none should be described as ready for legal use.

---

## 1. Current scope (what exists today)

### Routes

| Route | Type | What it is |
| --- | --- | --- |
| `/` | modified | Landing page. New **Legal Resources** section (carousel + "Browse All Resources") between the ADR explainer and the closing CTA. |
| `/resources` | new | Marketplace: search, category chips, free/paid filter, sort, featured strip, grid, empty state. Reads `?category=` and `?q=` on first load (so `/resources?category=nda` is a shareable deep link). Server-rendered on demand because it reads `searchParams`. |
| `/resources/[slug]` | new | Product detail. Pre-rendered for every listing (`generateStaticParams`). Unknown slugs return 404. |

Navigation changed too: `MarketingNav` gained a **Legal Resources** link and, because it had no mobile menu at all, a
hamburger menu (it is now a client component). On very narrow screens the header's "Get started" button moved into that
menu to make room; the hero still has its own "Start my dispute" CTA. `MarketingFooter` links to `/resources`.

### Files

```
src/lib/legal-resources.ts                      catalogue (11 listings), categories, filter/sort/search, helpers
src/components/resources/ResourceCover.tsx      generated, illustrative covers (6 layouts, 5 tones)
src/components/resources/ResourceCard.tsx       card used by the carousel, grid and "related" rows
src/components/resources/PriceTag.tsx           ₦ price, or a "Free example" badge
src/components/resources/ResourcesCarousel.tsx  dependency-free scroll-snap carousel (client)
src/components/resources/ResourcesBrowser.tsx   search / filters / sort / grid (client)
src/components/resources/PurchaseIntentButton.tsx + PurchaseIntentModal.tsx   the demo CTA (client)
src/components/resources/DemoNotice.tsx         the "demonstration catalogue" banner
src/components/marketing/LegalResourcesSection.tsx   landing section
src/components/marketing/MarketingNav.tsx, MarketingFooter.tsx   modified
src/app/resources/page.tsx, src/app/resources/[slug]/page.tsx    new routes
src/app/globals.css (+ .no-scrollbar), tailwind.config.ts (+ fadeUp keyframe)   small additions
```

### Demonstration data and imagery

- **Catalogue:** `src/lib/legal-resources.ts`, local data, no network. 11 listings across all 9 categories, including two
  free examples so the free-versus-paid distinction is visible. Prices run from free to ₦35,000 and are **proposed
  illustrative prices, not validated ones**. There are deliberately no reviews, ratings, purchase counts, testimonials,
  or revenue figures anywhere.
- **Images:** covers are **generated** (CSS + icons in MyRight's palette), not photographs. This was a deliberate
  choice: stock-photo URLs could not be verified for availability and per-image licence from the build environment, and a
  hotlinked image that disappears or turns out to be unlicensed is a worse outcome in front of an audience than a clean
  illustrative cover. The generated covers use bars instead of text, so they never pretend to show a real document, and
  each detail page says "Illustrative cover. It is not an image of the actual document."
  - To add real photographs later: add an optional `photo` (`src`, `alt`, `credit`) to `LegalResource`, have
    `ResourceCover` render it when present and fall back to the generated cover when it is absent or fails to load, and
    record each image's source and licence in this file. Prefer self-hosted copies under `public/` over hotlinking.
- **Sample wording** on detail pages is labelled as illustrative, is faded to show it is an excerpt, and is not a template.

### Interactions that work today

Search (matches the **start of words**, so "nda" finds NDAs but not "atte**nda**nce"), category chips with live counts
(a chip with no matches is disabled so it can't be a dead end), a free/paid toggle, four sort orders, a featured strip that
hides while filtering, clear-filters, an empty state, detail navigation with breadcrumbs, related resources, a working
carousel (swipe on touch, previous/next buttons on larger screens, reduced-motion aware), the mobile menu, and the
purchase-intent dialog (focus moves in, Tab is trapped, Escape and backdrop close it, focus returns to the button).

### Deliberately not built

Payments, orders, accounts-gated purchasing, receipts, file storage, downloads, a resources API, database tables, admin
screens, email delivery, reviews, and any simulated checkout. The "Get..." button opens a dialog that says purchasing is not
open yet and that no payment is taken and no document is delivered. It never shows a success state.

### How this was verified

- `tsc --noEmit` and `next build` pass; all 11 detail pages pre-render.
- The running production server was queried: landing, marketplace, filtered URLs, empty state, a hostile query string
  (rendered escaped), all detail pages, and a 404 for an unknown slug.
- Interactions were exercised in a simulated browser (jsdom): search, categories, price, sort, empty state, the dialog's
  focus handling and wording, carousel buttons, and the mobile menu. This tooling was temporary and is **not** part of the repo.
- **Not verified:** real-device layout and visual polish. No browser was available to render and screenshot the pages, so
  responsiveness is by construction (mobile-first Tailwind, scroll-snap, no fixed widths) and should be checked on a phone
  and a laptop before the pitch.

---

## 2. What the backend looks like today (so the plan fits it)

Facts about the existing `myright-server`, relevant to everything below:

- Node/TypeScript/Express with Prisma 5.22 on PostgreSQL (Aiven), deployed on Render; the Next.js frontend is on Vercel
  and **proxies every `/api/*` request to Render** (see `next.config.mjs`), so the browser sees one origin.
- Auth is session-cookie based with a **double-submit CSRF** check on state-changing routes (`requireCsrf`). Roles are
  `DISPUTANT`, `LAWYER`, `SUPERADMIN` (courthouse admin), `COURTHOUSE_STAFF` and `PLATFORM_ADMIN` (the company).
- **No payment provider is integrated.** There is no payments dependency, table or webhook route.
- A **storage abstraction exists**: `StorageProvider` with `putObject`, `getObject`, `deleteObject` and
  `getSignedDownloadUrl`, with a local-disk and an S3 implementation selected by `STORAGE_PROVIDER`. The S3 one returns
  5-minute presigned URLs; the local one returns `null`. It is used today for dispute evidence uploads.
- Uploads use `multer` memory storage and pass through the Vercel proxy, which enforces a hard, non-configurable
  4.5 MB request-body limit (the comment in `documents.service.ts` says so and names a presigned-PUT upload as the fix).
  Resource files are admin-uploaded and may be larger, so they should not use that path (see section 5).
- Notifications already exist (in-app `Notification`, WhatsApp/email delivery via `notification.service`, and a
  `NotificationLog` of every attempt) and can carry receipts and "your download is ready" messages.
- `AuditLog` and `writeAuditLog` already record sensitive admin actions.
- Express currently parses JSON globally (`app.use(express.json({ limit: "1mb" }))` in `app.ts`). Payment webhooks need the
  **raw** body for signature verification, so that route must be mounted before that line or given its own raw parser.
  Point the provider's webhook URL at the Render origin directly (it does not need the Vercel proxy or a session).

---

## 3. Future resource management

**Who manages the catalogue:** the platform owner (`PLATFORM_ADMIN`). Resources are a platform-wide product, not a
per-courthouse one, so this belongs next to the existing `/platform` area (for example `/platform/resources`), not in the
courthouse admin screens.

Sketch of the data model (Prisma). Names are suggestions; money is stored as **integer kobo**, not naira:

```prisma
enum ResourceStatus   { DRAFT IN_REVIEW PUBLISHED UNPUBLISHED ARCHIVED }
enum ReviewStatus     { NOT_REVIEWED IN_REVIEW APPROVED REJECTED }

model Resource {
  id            String         @id @default(cuid())
  slug          String         @unique
  title         String
  summary       String
  description   String
  kind          String                        // Template | Pack | Bundle | Guide | Checklist
  categoryId    String
  priceKobo     Int                           // 0 = free
  currency      String         @default("NGN")
  status        ResourceStatus @default(DRAFT)
  featured      Boolean        @default(false)
  audience      String[]
  includes      String[]
  limitations   String[]
  excerpt       Json?
  coverImageKey String?                       // optional; the generated cover is the fallback
  currentVersionId String?
  versions      ResourceVersion[]
  publishedAt   DateTime?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model ResourceVersion {
  id            String   @id @default(cuid())
  resourceId    String
  version       Int
  storageKey    String                         // never exposed to clients
  fileName      String
  mimeType      String
  sizeBytes     Int
  sha256        String
  changeNotes   String?
  // legal-content controls (section 5)
  reviewStatus  ReviewStatus @default(NOT_REVIEWED)
  reviewerName  String?
  reviewerCredential String?
  reviewedAt    DateTime?
  jurisdiction  String?
  nextReviewDue DateTime?
  createdAt     DateTime @default(now())
  @@unique([resourceId, version])
}
```

Categories can stay a code constant at first (as they are now) and become a table only if non-developers need to edit them.

**Admin workflows** (platform owner): create a draft, edit fields, upload a file as a new version, submit for review,
record review details, publish, unpublish, archive. Publishing must be **blocked** unless a file version exists and
(once policy requires it) its review status is `APPROVED`. Every state change goes through `writeAuditLog`. Unpublishing
hides a listing but must not revoke access for people who already bought it.

**Public API (read-only):** `GET /api/resources` (published only; filters and search server-side) and
`GET /api/resources/:slug`. These never return `storageKey`. The frontend then replaces `legal-resources.ts` with an API
client, keeping the same routes and components. `/resources/[slug]` moves from `generateStaticParams` to ISR
(`revalidate`) or on-demand revalidation when a listing changes.

---

## 4. Future purchasing and fulfilment

**Payment provider: not chosen, and nothing in the codebase assumes one.** Evaluate Nigerian-market providers against:
supports NGN card and bank transfer, hosted checkout (keeps card data off MyRight's servers), signed webhooks, a
sandbox, settlement timing and fees, refund API, and the business-verification (KYC) lead time. Provider terms and fees
change, so check them at selection time rather than from this document. Keep the integration behind a small internal
interface so the choice is reversible.

**Orders and payments** (new tables): `Order` (buyer, status, total, currency), `OrderItem` (resource, version bought,
price at time of purchase), `Payment` (provider, provider reference, amount, status, raw webhook payload with sensitive
fields removed, timestamps), `Refund`, and an `Entitlement` per buyer per resource version (the right to download).
Snapshot the price and version on the order so later edits to a listing never rewrite history.

**Order state machine:** `PENDING` -> `PAID` | `FAILED` | `CANCELLED` | `EXPIRED`, and `PAID` -> `REFUNDED` |
`PARTIALLY_REFUNDED`. Define each transition explicitly and make it compare-and-set (the status-change helper in
`disputes.service.ts` is the pattern to copy), so a webhook replayed or arriving twice cannot grant access twice.

**Server-side verification is the only source of truth.** The browser returning from the provider's page proves
nothing. An order becomes `PAID` only when (a) a webhook with a valid signature arrives **and** (b) the amount, currency and
reference match the order, ideally confirmed by a server-to-server lookup. Webhooks must be idempotent (store the provider
event id) and answer quickly. This route is exempt from CSRF (it carries no cookie) but protected by the signature check
and a rate limit.

**Reconciliation:** a scheduled job compares `PENDING` orders and recent provider transactions, to catch webhooks that
never arrived, and flags mismatches for a human. Refunds are initiated by the platform owner, recorded on `Refund`, and
revoke or retain the entitlement according to policy decided in advance.

**Account model, a decision to make early:** require a MyRight account to buy (reuses registration, login, the dashboard
and notifications; gives a purchase history for free), or allow guest checkout with email-only delivery (less friction,
more fraud and support surface). Requiring an account is the simpler and safer starting point.

**Frontend work:** replace the purchase-intent dialog with a checkout flow, add the pending/failed/cancelled/success
return pages, and add **My Resources** (purchase history and downloads) to the existing disputant dashboard.

---

## 5. Secure document delivery

- Resource files go in **private** storage under non-guessable keys, using the existing `StorageProvider`. Files are never
  served from a public path.
- Download flow: an authenticated `POST /api/resources/:id/download` checks the caller holds an `Entitlement`, writes a
  `DownloadLog` row, and returns a **short-lived presigned URL** from `getSignedDownloadUrl`, so the file streams from
  object storage straight to the browser and not through Vercel or Render (which have body-size and time limits). Because the local
  storage provider returns `null` for signed URLs, delivery should require `STORAGE_PROVIDER=s3` outside development.
- Admin upload of resource files should use a **direct-to-storage presigned upload** rather than `multer` through the
  proxy. The existing documents service already notes this as the real fix for larger files.
- Consider per-download watermarking (buyer name/email in the footer) as a deterrent to resharing, and rate-limit downloads
  per entitlement.
- A free resource still goes through sign-in and the same download path (no public file URLs), so downloads are countable.

---

## 6. Legal-content controls (must be settled before any real sale)

These are business and legal questions as much as engineering ones, and need a qualified lawyer's input, not just a developer's:

- **Ownership and distribution rights.** Who wrote each document, and does MyRight have the right to sell and license it?
  Record author, source and licence per resource.
- **Lawyer review.** Track `reviewStatus`, the reviewer's name and credential, the review date, and a next-review date.
  The product UI may show "reviewed by" **only** when an `APPROVED` record with those details exists. Nothing in the demo
  claims review, and the schema should make a false claim impossible to publish.
- **Jurisdiction and scope.** Each resource states where it applies (for example, which state or kind of arrangement) and
  what it does not cover. Rules differ by state and sector.
- **Versioning.** Laws change. Keep old versions, tell past buyers when an updated version exists, and show a "last reviewed" date.
- **Customer-facing terms.** A licence (for example: personal or single-business use, no resale), a plain disclaimer that
  resources are general information and not legal advice, and a clear refund policy for digital goods.
- **Privacy and security.** Purchase records tie a person to a legal need, which can be sensitive. Apply the same
  care the dispute data already gets: minimal retention, access limited to need, no document contents or personal data in
  logs. Confirm current data-protection obligations (Nigeria's data-protection law) and consumer-protection and tax treatment of
  digital sales with counsel and an accountant.

---

## 7. Implementation sequence

**Phase 0: Frontend demonstration (done).** Everything in section 1.

**Phase 1: Resource management and database.** Prisma models and migration for `Resource` / `ResourceVersion`; the
read-only public API; platform-owner admin screens (create, edit, upload, publish/unpublish); audit logging; swap the frontend
from local data to the API behind the same routes; ISR for detail pages. *Depends on:* a decision on the real catalogue and
who produces it. *Exit:* a platform owner can publish a real listing with no payment attached.

**Phase 2: Payments and orders.** Choose a provider and complete its business verification (**start this early, as it can take weeks and is
outside the codebase**); `Order` / `Payment` / `Refund` / `Entitlement`; hosted checkout; signed, idempotent webhooks on a raw-body
route; the order state machine; reconciliation job; receipts via the existing email/WhatsApp notifications; sandbox end-to-end tests including
duplicate, delayed and out-of-order webhooks. *Depends on:* Phase 1, the account-vs-guest decision, provider onboarding.

**Phase 3: Secure delivery.** Private bucket, presigned downloads gated on entitlements, `DownloadLog`, direct-to-storage admin
upload, My Resources in the dashboard, optional watermarking. *Depends on:* Phase 2 producing trustworthy entitlements;
production `STORAGE_PROVIDER=s3` and bucket policy.

**Phase 4: Administration and production hardening.** Refund and dispute handling UI, sales and download reporting for the
platform owner, review-due reminders, versioned-update notifications to buyers, monitoring and alerting on webhook failures, backups and
retention, load and security testing, and the customer-facing terms/disclaimer/refund pages published.

### Must be true before a real customer can buy

1. Real documents exist, rights are confirmed, and the review process in section 6 has been run for each one sold.
2. A payment provider is chosen, verified for MyRight, and tested end to end in its sandbox.
3. Payment confirmation is server-side, signed and idempotent, with reconciliation in place.
4. Files are private and delivered only to verified buyers.
5. Terms, licence, disclaimer, and refund policy are published, and privacy and tax questions are answered.
6. Someone owns support: failed payments, refunds, "I didn't get my download".

### Open decisions

Account required vs guest checkout; which provider; who authors and reviews documents; whether bundles are priced as separate products
or as a discount rule; whether free resources require sign-in (recommended: yes); refund policy for digital goods.
