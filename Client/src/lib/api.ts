/**
 * Every request to the MyRight API goes through this. It is client-side
 * only (uses the browser's fetch with credentials), which is a
 * deliberate simplification, see the note at the bottom of this file for
 * why.
 */

// Relative, not the backend's own domain. See next.config.mjs, /api/*
// is proxied through this same origin to the real backend server-side,
// specifically so the session cookie is a first-party cookie from the
// browser's point of view. Safari blocks cross-site cookies outright
// (Intelligent Tracking Prevention), regardless of SameSite/Secure
// attributes, calling the backend's domain directly here would silently
// break login for every Safari and iOS user.
const API_BASE = "";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/**
 * The backend's CSRF cookie is not httpOnly, but that only means JS *on
 * the backend's own origin* could read it, this frontend runs on a
 * different domain, and document.cookie never exposes cookies belonging
 * to another origin regardless of the httpOnly flag. So instead of
 * reading it locally, we ask the backend for the value directly (see
 * GET /api/auth/csrf), cache it in memory, and echo it back in the
 * x-csrf-token header the backend's double-submit check expects. This is
 * safe because a page on another origin can't read this endpoint's JSON
 * response either, CORS blocks that the same way it protects everything
 * else here.
 */
let cachedCsrfToken: string | null = null;

async function fetchCsrfToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/csrf`, { credentials: "include" });
    const payload = await res.json().catch(() => null);
    cachedCsrfToken = payload?.data?.csrfToken ?? null;
  } catch {
    cachedCsrfToken = null;
  }
  return cachedCsrfToken;
}

async function ensureCsrfToken(): Promise<string | null> {
  if (cachedCsrfToken) return cachedCsrfToken;
  return fetchCsrfToken();
}

/** Called on logout so the next login fetches a fresh token rather than reusing a stale cached one. */
export function clearCachedCsrfToken(): void {
  cachedCsrfToken = null;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Internal: set on the retry attempt to avoid looping forever if the token is somehow still invalid. */
  _isRetry?: boolean;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = {};

  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  if (method !== "GET") {
    const csrfToken = await ensureCsrfToken();
    if (csrfToken) headers["x-csrf-token"] = csrfToken;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: "include",
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const code = payload?.error?.code ?? "UNKNOWN_ERROR";
    const message = payload?.error?.message ?? "Something went wrong. Please try again.";

    // A cached token can go stale (e.g. the cookie expired or was
    // cleared server side without the frontend knowing). If the server
    // specifically rejected it as a CSRF problem, refresh once and retry
    // before surfacing an error to the caller.
    if (code === "FORBIDDEN" && message.toLowerCase().includes("csrf") && !options._isRetry) {
      cachedCsrfToken = null;
      return apiFetch<T>(path, { ...options, _isRetry: true });
    }

    throw new ApiError(res.status, code, message);
  }

  return payload?.data as T;
}

export async function apiUpload<T>(path: string, file: File): Promise<T> {
  const formData = new FormData();
  formData.append("file", file);
  const csrfToken = await ensureCsrfToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: csrfToken ? { "x-csrf-token": csrfToken } : undefined,
    body: formData,
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, payload?.error?.code ?? "UNKNOWN_ERROR", payload?.error?.message ?? "Upload failed.");
  }
  return payload?.data as T;
}

export function documentDownloadUrl(disputeId: string, documentId: string): string {
  return `${API_BASE}/api/disputes/${disputeId}/documents/${documentId}/download`;
}

/**
 * Why client-side only: Next.js Server Components could forward the
 * incoming request's cookies to the backend and fetch data server-side,
 * which would give real server rendering instead of loading spinners.
 * That path was deliberately not taken for this milestone, it roughly
 * doubles every data-fetching call site (a server fetcher and a client
 * fetcher, or a shared one threading cookies() through everywhere) for a
 * benefit (first-paint speed, SEO) that mostly doesn't matter behind a
 * login wall. If that trade-off stops being right, e.g. once real usage
 * data shows the loading states are a problem, migrating the read paths
 * to Server Components is a page-by-page change, not a rewrite, since
 * they'd call this same backend API.
 */
