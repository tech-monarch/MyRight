# MyRight: Frontend (Milestone 8)

Next.js 14 (App Router) + TypeScript + Tailwind. This milestone wires the
UI to the real backend (see the separate `myright-backend` project),
mock data is gone.

## New in this milestone

- **Admin Settings**: a WhatsApp connect card (QR code, polls status
  every 2.5s while pairing, shows the connected number once linked).
- **Lawyer Settings**: a Google Meet connect card (redirects to Google's
  consent screen and back) and a weekly availability editor.
- **Case detail**: a new "Mediation" tab with a session scheduler
  (Google Meet or a pasted link) and a resolution/e-signature panel
  (propose terms, disputant signs in-app, a copyable link for the other
  party if WhatsApp delivery isn't available).
- **`/sign/[token]`**: a standalone public page (no MyRight account, no
  sidebar) where the other party reviews the resolution terms and signs
  by typing their name.

## What changed from Milestone 4
- `src/lib/api.ts`: the real API client. Client-side only, see the note
  at the bottom of that file for why (short version: it makes the
  loading states honest instead of pretending Server Components are
  fetching data they aren't).
- `src/lib/auth-client.ts`, `disputes-client.ts`, `admin-client.ts`:
  replace the old mock modules with real calls to the Express API.
- `src/lib/useApi.ts`: a small shared data-fetching hook, every page that
  needs data uses this instead of a bespoke `useEffect`.
- `src/components/auth/RequireAuth.tsx`: client-side route protection.
  Deliberately **not** Next.js middleware, see the comment in that file,
  the frontend and backend run on different origins so middleware cannot
  see the backend's session cookie. This calls `/api/auth/me` once and
  redirects if it fails. It is a UX convenience, not a security boundary,
  the backend enforces access control independently on every request
  regardless of what this component decides.
- Every page that read from the old mock arrays now fetches real data,
  with loading and error states, and every form that used to fake a
  network delay now calls the real backend and handles real errors.
- The intake wizard genuinely creates a dispute, uploads evidence, and
  runs real AI analysis, it no longer simulates any of this.

## Known limitations
- **This has not been run against a live backend.** The backend's own
  README documents that `prisma generate` could not be verified in the
  sandbox this was built in either. The two need to be tested together:
  run the backend (`npm run dev` there), set `NEXT_PUBLIC_API_URL` to
  point at it, and click through the app for real.
- `RequireAuth`'s role check is UX only, see the comment in that file.
  A determined user could still hit a protected page's client code
  before the redirect fires, they would just get 401/403 responses from
  every real API call, since the backend checks independently. This is
  the same "frontend is not the security boundary" principle the backend
  README already states, repeated here because it is worth being
  explicit about on both sides.
- Some admin/settings functionality has no backend endpoint yet
  (courthouse name editing, disputant profile editing), those pages say
  so directly rather than pretending to save.
- Notifications pages are still static placeholders, there is no
  notifications API yet (flagged as not-yet-built in the backend README
  too).

## Local development

```bash
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL should point at your running backend, default
# assumes it's on http://localhost:4000

npm install
npm run dev
```

Requires the backend (`myright-backend`) running separately, seeded
(`npm run seed` in that project) for the sample accounts to exist.

## Style note

No em dashes anywhere in copy or code comments, by request. Use commas,
colons, or periods instead.
