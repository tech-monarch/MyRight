/**
 * Connection helpers for Prisma + managed Postgres (Aiven).
 *
 * Deliberately has no @prisma/client import: errors are recognised by their
 * `code` / `errorCode` fields, so this module is trivially unit-testable and
 * cannot be broken by a missing `prisma generate`.
 *
 * Nothing here ever logs or returns a connection string.
 */

export interface PoolDefaults {
  /** Max connections this process may open (Prisma `connection_limit`). */
  connectionLimit: number;
  /** Seconds to wait for a free pooled connection (`pool_timeout`). */
  poolTimeoutSeconds: number;
  /** Seconds to wait when opening a new connection (`connect_timeout`). */
  connectTimeoutSeconds: number;
}

/**
 * Adds Prisma pool parameters to a connection URL ONLY when the URL does not
 * already set them, so anything configured explicitly in the Render env var
 * always wins. Credentials, host, port, database and every existing query
 * parameter (including sslmode) are preserved untouched.
 *
 * Returns undefined if the URL cannot be parsed; the caller then lets Prisma
 * use the original env var unchanged. The URL is never included in an error.
 */
export function withPoolDefaults(rawUrl: string, defaults: PoolDefaults): string | undefined {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return undefined;
  }

  const setIfAbsent = (key: string, value: number) => {
    if (!url.searchParams.has(key)) url.searchParams.set(key, String(value));
  };
  setIfAbsent("connection_limit", defaults.connectionLimit);
  setIfAbsent("pool_timeout", defaults.poolTimeoutSeconds);
  setIfAbsent("connect_timeout", defaults.connectTimeoutSeconds);

  return url.toString();
}

/**
 * Prisma codes that mean "could not reach / lost the database", i.e. nothing
 * was executed. P2024 (pool timeout) is excluded on purpose: retrying under
 * pool exhaustion makes it worse.
 *   P1001 can't reach server      P1002 server reached but timed out
 *   P1008 operation timed out     P1017 server closed the connection
 */
const TRANSIENT_CONNECTION_CODES = new Set(["P1001", "P1002", "P1008", "P1017"]);

export function isTransientConnectionError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const e = err as { code?: unknown; errorCode?: unknown };
  const code = typeof e.errorCode === "string" ? e.errorCode : typeof e.code === "string" ? e.code : "";
  return TRANSIENT_CONNECTION_CODES.has(code);
}

export function isUniqueConstraintError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: unknown }).code === "P2002";
}

export interface RetryOptions {
  /** Total attempts including the first. Hard-capped at 3. */
  attempts?: number;
  baseDelayMs?: number;
  /** Injectable for tests. */
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Runs a READ-ONLY database operation, retrying a small, bounded number of
 * times on transient connection errors with exponential backoff + jitter.
 *
 * Only use this for reads. Writes must not be wrapped: a write whose
 * acknowledgement was lost could be applied twice.
 *
 * `operation` must create a fresh query on each call (Prisma queries are lazy,
 * so `() => prisma.user.findUnique(...)` is correct).
 */
export async function withReadRetry<T>(operation: () => PromiseLike<T>, options: RetryOptions = {}): Promise<T> {
  const attempts = Math.min(Math.max(options.attempts ?? 3, 1), 3);
  const baseDelayMs = options.baseDelayMs ?? 250;
  const sleep = options.sleep ?? defaultSleep;

  for (let attempt = 1; ; attempt++) {
    try {
      return await operation();
    } catch (err) {
      if (attempt >= attempts || !isTransientConnectionError(err)) throw err;
      const backoff = baseDelayMs * 2 ** (attempt - 1);
      await sleep(backoff + Math.floor(Math.random() * backoff * 0.5));
    }
  }
}
