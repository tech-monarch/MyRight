# MyRight: Backend (Milestone 9)

Node.js + TypeScript + Express API, PostgreSQL via Prisma, Gemini-powered
RAG, mediation scheduling with embedded Daily.co video, WhatsApp
notifications, and e-signature. This replaces the old Supabase-based
server, no Supabase dependency anywhere in this codebase.

## Verified against a real database

A real `prisma migrate dev` run (by the project owner, not in the sandbox
this was built in) confirmed the Milestone 6 schema, including the
pgvector extension and every RAG table, migrates cleanly against actual
PostgreSQL. That migration is checked in at
`prisma/migrations/20260911092150_init`, plus a second one for the
mediation/resolution/notification models added after it. The video model
changed again in this milestone (Google Meet replaced with Daily.co,
including dropping the `GoogleAccountConnection` table entirely and
adding `MediationAttendance`), running `npx prisma migrate dev` once more
will generate a third migration for that diff.

## What's in this milestone (on top of Milestones 5-8)

- **Mediator scheduling** (`modules/mediation/`): a lawyer sets recurring
  weekly availability (`MediatorAvailability`), and a `MediationSession`
  can be scheduled for a case once a mediator is assigned. Scheduling a
  session automatically advances the case to `IN_MEDIATION`.
- **Embedded video via Daily.co** (`infrastructure/video/daily.provider.ts`):
  replaces the earlier Google Meet integration entirely. One
  platform-level API key, not a per-mediator OAuth connection, session
  creation just works with no setup step for lawyers. Rooms are created
  with a real waiting room (`enable_knocking`, the mediator admits each
  party), breakout room support (for caucusing, meeting privately with
  one side), live captions, and a join window matched to the session's
  scheduled start/end (`nbf`/`exp`, plus `eject_at_room_exp` so a room
  doesn't linger open indefinitely). Falls back to a manually pasted link
  if a mediator prefers a different tool.
- **Attendance records** (`MediationAttendance`): pulled from Daily's
  presence API after a session's scheduled end time passes (see
  `syncAttendance` in `sessions.service.ts`, called on-demand when the
  session list is viewed, not via webhook, see the code comment on that
  tradeoff). A record of who actually joined and for how long, useful for
  a dispute process specifically, not just a video nicety.
- **Outcome notes**: a mediator can record a short free-text summary of
  what happened in a session (`MediationSession.outcomeNotes`), separate
  from a `Resolution`'s binding terms, useful even when a session doesn't
  end in an agreement.
- **E-signature** (`modules/resolution/`): a `Resolution`'s terms get
  signed by the disputant (authenticated) and the other party (via a
  single-use, hashed, expiring token link, they have no MyRight account).
  Both signatures present moves the case to `RESOLVED`. This is a typed
  name + timestamp + IP signature, not a cryptographic digital signature,
  see the schema comment on `ResolutionSignature`, worth being honest
  with users about what "signing" means here.
- **WhatsApp notifications** (`infrastructure/notifications/`): via
  Baileys (`@whiskeysockets/baileys`), **read the caveats in
  `whatsapp.provider.ts` before enabling this**. Short version: it's not
  an official API, a real WhatsApp number gets linked by scanning a QR
  code (SuperAdmin does this from the admin dashboard), it's against
  WhatsApp's terms of service, and it needs a persistent process, not a
  stateless request/response. Off by default (`WHATSAPP_ENABLED=false`).
  Every send attempt, success, failure, or skipped (no phone on file, not
  connected), is logged to `NotificationLog`.

  **Installed as an `optionalDependency`, not a regular one.** Baileys'
  own `package.json` pulls its `libsignal` dependency straight from
  GitHub (`libsignal: "github:WhiskeySockets/libsignal-node"`) rather
  than the npm registry, some npm configs (corporate proxies, certain CI
  environments) refuse to fetch git-based dependencies at all and will
  abort `npm install` entirely over this one package. Marking it optional
  means `npm install` succeeds (with a warning) even where that fetch
  fails, and the code loads Baileys lazily at runtime
  (`loadBaileys()` inside `whatsapp.provider.ts`) rather than at import
  time, so the rest of the server is unaffected either way. If you hit
  this and actually want WhatsApp notifications, install it explicitly
  once your npm config allows git dependencies:
  `npm install @whiskeysockets/baileys`.

### Not in this milestone, deliberately deferred

- **Pre-session reminders** (a WhatsApp message N minutes before a
  session starts). This needs real delayed/scheduled job infrastructure,
  the existing patterns in this codebase (the ingestion queue) are
  immediate, fire-on-event, not time-delayed, bolting a reminder onto
  that shape would mean a fragile polling loop. Worth doing once a real
  job scheduler (pg-boss, reusing the Postgres already required here, is
  the natural choice) is justified by more than just this one feature.
- **Session recording.** Daily supports it as a room flag, but a
  recording of a legal mediation session needs an explicit, informed
  two-party consent flow before it's ethical or likely legal to turn on,
  not just a checkbox in a scheduling form. Needs a product decision
  first.

### New environment variables

See `.env.example` for the full list. At minimum for these features:
`DAILY_API_KEY` (get one at https://dashboard.daily.co/developers),
`WHATSAPP_ENABLED` + `WHATSAPP_AUTH_DIR` (WhatsApp), `APP_URL` (used to
build the resolution signing link).

### New endpoints

```
GET    /api/mediation/availability/me           (lawyer's own availability)
PUT    /api/mediation/availability/me            (replace it)
GET    /api/mediation/availability/:lawyerId

GET    /api/disputes/:disputeId/sessions          (also syncs attendance for any past-due session)
POST   /api/disputes/:disputeId/sessions          (mediator/SuperAdmin only, creates a Daily room by default)
POST   /api/disputes/:disputeId/sessions/:id/cancel
POST   /api/disputes/:disputeId/sessions/:id/outcome  (mediator only, records notes and marks the session COMPLETED)

GET    /api/disputes/:disputeId/resolution
POST   /api/disputes/:disputeId/resolution       (owner or mediator, returns a one-time signingUrl)
POST   /api/disputes/:disputeId/resolution/sign  (disputant only)
GET    /api/sign/:token                          (public, the other party's signing page)
POST   /api/sign/:token                          (public)

GET    /api/admin/whatsapp/status                (SuperAdmin)
POST   /api/admin/whatsapp/connect               (starts pairing, poll /status for the QR code)
POST   /api/admin/whatsapp/disconnect
```

## Known limitation specific to this milestone

None of the mediation/Google/resolution/WhatsApp code above has been run
against a live environment yet (unlike the Milestone 5/6 schema, which
now has that real migration proving it out). The same request from
Milestone 5/6 stands, more so here given the OAuth flow and Baileys'
stateful connection: please treat the first real run of these features
as a genuine test, not a formality.

---

## What's in this milestone

Everything from Milestone 5 (auth, RBAC, disputes, documents, admin), plus
a genuine Retrieval-Augmented Generation pipeline:

- **pgvector**: enabled via Prisma's `postgresqlExtensions` preview
  feature. `DocumentChunk` (per-dispute, from uploaded evidence) and
  `KnowledgeChunk` (shared, from the curated ADR/legal knowledge base)
  each carry a `vector(768)` embedding column.
- **Ingestion pipeline** (`modules/rag/ingestion.service.ts`): download
  from storage, extract text (PDF via `pdf-parse`, DOCX via `mammoth`),
  chunk (`modules/rag/chunking.ts`, fixed-size with overlap, documented as
  a starting point, not a final answer), embed each chunk with
  `gemini-embedding-001`, store via raw SQL (Prisma's query builder
  doesn't support the `vector` type). Runs on a minimal in-process queue
  (`jobs/ingestion-queue.ts`) after upload, not synchronously in the
  upload request. See that file for the queue's known limitations and
  the documented upgrade path.
- **Retrieval** (`modules/rag/retrieval.service.ts`): cosine similarity
  search, authorization-scoped by filtering `document_chunks` to a
  single `disputeId` the caller has already verified access to (never
  by trusting an id from the request), plus a similarity floor so
  irrelevant chunks don't make it into the prompt, plus a simple
  authority-weighting on knowledge base results.
- **Grounded generation** (`modules/rag/rag.service.ts`,
  `modules/rag/prompts.ts`): retrieved chunks are assembled into a
  labeled context block, a shared system prompt instructs Gemini to
  ground claims in that context, cite only what's actually retrieved, and
  say so when it doesn't have enough information rather than guess.
  Structured output (dispute analysis) is validated against a Zod schema
  server side before it's trusted, see `modules/rag/rag.schemas.ts`.
- **AI provider abstraction** (`infrastructure/ai/`): `GeminiProvider`
  implements a generic `AIProvider` interface (embed / generateStructured
  / generateText) over the plain Gemini REST API, model names are
  environment-configurable, not hardcoded.
- **New endpoints**: `POST/GET /api/disputes/:id/analysis` (structured,
  grounded dispute analysis with citations) and
  `GET/POST /api/disputes/:id/messages` (the AI Assistant chat, persisted,
  with a bounded conversation window).
- **Knowledge base tooling**: `npm run ingest-knowledge` reads from
  `knowledge-base/`, `npm run evaluate-rag` is a retrieval review harness
  covering the RAG spec's required evaluation categories (answerable,
  unanswerable, adversarial). See "Knowledge base" below, **the shipped
  content is clearly-labeled placeholder text, not real law**.

## Not yet built (upcoming milestones)
- Wiring the frontend's mock data layers (`src/lib/*` in the Next.js app)
  to these real endpoints.
- Notifications (email/in-app).
- Automated tests. The codebase is structured to make them straightforward
  to add module by module (see "Testing" below), but none are written yet.
- OCR for scanned images/PDFs (see "AI Limitations" below).
- A real reranking step for retrieval. The current authority-weighting in
  `retrieveKnowledgeChunks` is a simple version of this, a dedicated
  reranker is a reasonable next iteration once there's enough real query
  traffic to tell whether it's actually needed.

## AI Limitations (read before deploying)
- **The knowledge base is placeholder content.** `knowledge-base/examples/`
  contains generic, non-authoritative descriptions of ADR concepts,
  clearly labeled `[EXAMPLE PLACEHOLDER]` in their titles, used only to
  prove the ingestion -> retrieval -> generation pipeline works end to
  end. Do not treat MyRight's answers as grounded in real Nigerian law
  until this is replaced with actual sourced legislation, ADR institution
  rules, and reviewed by someone qualified to judge accuracy. See
  `knowledge-base/README.md`.
- **OCR is not implemented.** An uploaded JPG/PNG or legacy `.doc` file is
  stored and downloadable as evidence, but its content is not searchable
  by the AI assistant, `text-extraction.ts` returns `null` for these and
  the document is still marked `READY` (uploaded successfully) with zero
  chunks.
- **The ingestion queue is in-process only**, not persisted or
  distributed. See the comment in `jobs/ingestion-queue.ts` for what a
  server restart mid-job does and the documented upgrade path (pg-boss,
  reusing the Postgres already required here, or BullMQ/Redis).
- **Grounding is enforced by prompt instructions and a similarity floor**,
  not by a hard technical guarantee. Gemini is instructed not to invent
  citations and the backend validates structured output against a Zod
  schema, but nothing stops the model from ignoring the instruction. Use
  `npm run evaluate-rag` regularly, especially the adversarial test case,
  and treat its output as something a person needs to actually read, not
  a pass/fail gate.

## Important limitations carried over from Milestone 5
- **`prisma generate` could not be run or verified in the environment this
  was built in** (the sandbox's network allowlist does not include
  `binaries.prisma.sh`). Every file was still typechecked with
  `tsc --noEmit`, and the only remaining errors are "has no exported
  member" on `@prisma/client` types that only exist after `prisma
  generate` runs, or implicit-`any` errors that are a direct consequence
  of that (see the `$queryRaw`/`findMany` calls in `rag/retrieval.service.ts`
  and `rag/rag.service.ts`, both should resolve to real types once the
  client is generated). Run `npm install && npx prisma generate` in an
  environment with normal internet access before trusting this compiles
  end to end, **this has still not been verified against a real
  Postgres+pgvector database**, that verification matters more for this
  milestone than the last one given how much of it is raw SQL.
- `AuditLog` rows are not tagged with a courthouse (fine for one
  courthouse, needs a column added before a second one is onboarded).
- Unassigned disputes are visible to every courthouse's SuperAdmin.

## Local development

```bash
cp .env.example .env
# edit .env, at minimum set DATABASE_URL to a real Postgres instance
# with the pgvector extension available (e.g. the pgvector/pgvector
# Docker image, or any managed Postgres that offers pgvector as an
# add-on)

npm install
npx prisma migrate dev --name init
psql "$DATABASE_URL" -f prisma/manual-sql/001-vector-indexes.sql
npm run seed                # creates a SuperAdmin, a Lawyer, and a sample Disputant
npm run ingest-knowledge    # loads the example knowledge base (see "Knowledge base" below)
npm run dev                 # http://localhost:4000
```

Try the RAG pipeline once seeded: log in as the sample disputant, then
`POST /api/disputes/seed-dispute-1/analysis` (with `GEMINI_API_KEY` set)
should return a structured analysis citing the example knowledge base.
`npm run evaluate-rag` runs the retrieval review harness independently of
the API.

Seeded accounts (see `prisma/seed.ts`), all use password `ChangeMe123!`:
- SuperAdmin: username `superadmin`
- Lawyer: username `chinelo.adeyemi` (flagged to change password on first login)
- Disputant: email `adaeze@example.com`

## Knowledge base

`knowledge-base/` holds the source files for MyRight's curated ADR/legal
knowledge base. **The content shipped in `knowledge-base/examples/` is
placeholder text, not real law**, see `knowledge-base/README.md` for why
and what has to happen before this is used by real people. To add real
content: drop a file in `knowledge-base/`, add an entry to the manifest in
`scripts/ingest-knowledge.ts` with accurate metadata (title, source type,
jurisdiction, authority level, source URL), then run
`npm run ingest-knowledge`.

## Environment variables

See `.env.example` for the full list with descriptions. Nothing in this
repository contains real secrets, that file has placeholders only.

## API overview

All responses follow `{ success: boolean, data?, error? }`. All
state-changing requests (anything but GET) require the `x-csrf-token`
header to match the `myright_csrf` cookie, which the login/register
response sets.

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/change-password

GET    /api/disputes                          (own disputes, or assigned cases for a lawyer)
POST   /api/disputes                          (disputant only)
GET    /api/disputes/:id
PATCH  /api/disputes/:id                      (owner only, while DRAFT/UNDER_REVIEW)
POST   /api/disputes/:id/mediation-request

GET    /api/disputes/:disputeId/documents
POST   /api/disputes/:disputeId/documents     (multipart, field name "file")
GET    /api/disputes/:disputeId/documents/:documentId/download

POST   /api/disputes/:id/analysis             (runs grounded RAG analysis, stores it, returns it)
GET    /api/disputes/:id/analysis             (most recent stored analysis, or null)
GET    /api/disputes/:id/messages             (AI Assistant chat history)
POST   /api/disputes/:id/messages             (send a message, returns the grounded reply)

POST   /api/admin/lawyers                     (SuperAdmin only, returns a one-time temp password)
GET    /api/admin/lawyers
GET    /api/admin/lawyers/:id
POST   /api/admin/lawyers/:id/status
POST   /api/admin/lawyers/:id/reset-password
POST   /api/admin/lawyers/:id/assignments
DELETE /api/admin/assignments/:disputeId
GET    /api/admin/cases
GET    /api/admin/audit-log
```

## Testing

Not yet implemented (see "Not yet built" above). The module boundaries
(`*.service.ts` for business logic, `*.controller.ts` for HTTP glue,
`*.policy.ts` for authorization) are structured so each can be unit tested
independently once tests are written, and `vitest` is already a
dependency for that.

## Style note

No em dashes anywhere in copy or code comments, by request. Use commas,
colons, or periods instead.
