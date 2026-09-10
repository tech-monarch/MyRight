/**
 * Every request to the MyRight API goes through this. It is client-side
 * only (reads document.cookie, uses the browser's fetch with
 * credentials), which is a deliberate simplification, see the note at
 * the bottom of this file for why.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : null;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = {};

  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  // The backend's CSRF middleware requires this header to match the
  // (non-httpOnly) csrf cookie on every state-changing request, see
  // server/src/middleware/csrf.ts for the corresponding check.
  if (method !== "GET") {
    const csrfToken = readCookie("myright_csrf");
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
    throw new ApiError(res.status, code, message);
  }

  return payload?.data as T;
}

export async function apiUpload<T>(path: string, file: File): Promise<T> {
  const formData = new FormData();
  formData.append("file", file);
  const csrfToken = readCookie("myright_csrf");

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
