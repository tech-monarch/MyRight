/**
 * Read-only database connectivity check. Run: npm run db:check
 *
 * Only issues SELECT / SHOW. Never writes, migrates, or deletes. Prints
 * host, port and result codes only: no passwords, no connection strings.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

function describe(label: string, raw: string | undefined) {
  if (!raw) return console.log(`${label}: NOT SET`);
  try {
    const u = new URL(raw);
    console.log(`${label}: host=${u.hostname} port=${u.port || "(default)"} db=${u.pathname.slice(1)} sslmode=${u.searchParams.get("sslmode") ?? "(none)"} pgbouncer=${u.searchParams.get("pgbouncer") ?? "(none)"}`);
  } catch {
    console.log(`${label}: set but not a parseable URL (check quoting / special characters)`);
  }
}

function safeReason(err: unknown): string {
  const e = err as { name?: string; errorCode?: string; code?: string; message?: string };
  const lastLine = (e.message ?? "").split("\n").map((l) => l.trim()).filter(Boolean).pop() ?? "";
  const cleaned = lastLine.replace(/postgres(ql)?:\/\/\S+/gi, "[redacted-url]");
  return `${e.name ?? "Error"} ${e.errorCode ?? e.code ?? ""} ${cleaned}`.trim();
}

async function probe(label: string, url: string | undefined) {
  if (!url) return null;
  const client = new PrismaClient({ datasourceUrl: url, log: [] });
  const started = Date.now();
  try {
    await client.$queryRaw`SELECT 1`;
    console.log(`[OK]   ${label}: SELECT 1 succeeded in ${Date.now() - started} ms`);
    return client;
  } catch (err) {
    console.log(`[FAIL] ${label}: ${safeReason(err)}`);
    await client.$disconnect().catch(() => undefined);
    return null;
  }
}

async function main() {
  describe("DATABASE_URL", process.env.DATABASE_URL);
  describe("DIRECT_URL  ", process.env.DIRECT_URL);
  if (process.env.DATABASE_URL && process.env.DATABASE_URL === process.env.DIRECT_URL) {
    console.log("note: both URLs are identical, so no pooler is in use.");
  }

  const runtime = await probe("runtime (DATABASE_URL)", process.env.DATABASE_URL);
  const direct = await probe("direct  (DIRECT_URL)  ", process.env.DIRECT_URL);
  const client = direct ?? runtime;
  if (!client) {
    console.log("\nNo connection succeeded. This points at the service or network (see runbook), not the code.");
    return process.exitCode = 1;
  }

  try {
    const [ver] = await client.$queryRaw<{ v: string }[]>`SHOW server_version`;
    const [max] = await client.$queryRaw<{ v: string }[]>`SHOW max_connections`;
    const [used] = await client.$queryRaw<{ n: bigint }[]>`SELECT count(*) AS n FROM pg_stat_activity`;
    console.log(`server_version=${ver?.v} max_connections=${max?.v} connections_in_use=${used?.n}`);

    const ext = await client.$queryRaw<{ extname: string }[]>`SELECT extname FROM pg_extension WHERE extname = 'vector'`;
    console.log(`pgvector extension: ${ext.length ? "installed" : "MISSING"}`);

    const tables = await client.$queryRaw<{ table_name: string }[]>`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    const have = new Set(tables.map((t) => t.table_name));
    const expected = ["users", "sessions", "disputes", "documents", "document_chunks", "knowledge_chunks", "mediation_sessions", "mediator_availability", "mediation_attendance", "resolutions", "resolution_signatures", "resolution_signing_tokens", "notification_logs", "audit_logs"];
    const missing = expected.filter((t) => !have.has(t));
    console.log(`tables present: ${have.size}; expected-but-missing: ${missing.length ? missing.join(", ") : "none"}`);

    try {
      const mig = await client.$queryRaw<{ migration_name: string; applied: boolean }[]>`SELECT migration_name, (finished_at IS NOT NULL AND rolled_back_at IS NULL) AS applied FROM _prisma_migrations ORDER BY started_at`;
      for (const m of mig) console.log(`migration: ${m.migration_name} applied=${m.applied}`);
    } catch {
      console.log("_prisma_migrations: not found (database not managed by prisma migrate yet)");
    }
  } catch (err) {
    console.log(`[FAIL] inspection query: ${safeReason(err)}`);
    process.exitCode = 1;
  } finally {
    await runtime?.$disconnect();
    await direct?.$disconnect();
  }
}

main();
