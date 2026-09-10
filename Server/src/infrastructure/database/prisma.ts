import { PrismaClient } from "@prisma/client";
import { isProduction } from "@/config/env";

// Standard Next.js/Node dev-server-safe singleton: without this, hot
// reload during development would open a new PrismaClient (and a new
// connection pool) on every file save.
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProduction ? ["error", "warn"] : ["error", "warn"],
  });

if (!isProduction) {
  globalForPrisma.prisma = prisma;
}
