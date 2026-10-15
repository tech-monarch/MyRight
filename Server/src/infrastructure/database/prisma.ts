import { PrismaClient } from "@prisma/client";
import { env, isProduction } from "@/config/env";
import { withPoolDefaults } from "@/infrastructure/database/resilience";

// Standard Node dev-server-safe singleton: without this, hot reload during
// development would open a new PrismaClient (and a new connection pool) on
// every file save. In production the module is evaluated once, so one client
// (one pool) exists for the whole process. Never call $disconnect per request.
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Adds connection_limit / pool_timeout / connect_timeout only when the URL
// doesn't set them already. TLS parameters (sslmode, etc.) are left exactly as
// provided. If the URL can't be parsed we pass nothing and Prisma reads
// DATABASE_URL itself, so this can never make things worse.
const datasourceUrl = withPoolDefaults(env.DATABASE_URL, {
  connectionLimit: env.DATABASE_POOL_MAX,
  poolTimeoutSeconds: 20,
  connectTimeoutSeconds: 15,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(datasourceUrl ? { datasourceUrl } : {}),
    log: ["error", "warn"],
  });

if (!isProduction) {
  globalForPrisma.prisma = prisma;
}
