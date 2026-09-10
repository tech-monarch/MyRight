import { prisma } from "@/infrastructure/database/prisma";
import type { AuditResult } from "@prisma/client";

interface AuditParams {
  actorId?: string | null;
  actorLabel: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  result: AuditResult;
  metadata?: Record<string, unknown>;
}

/**
 * Writes never throw into the caller's request flow: a logging failure
 * should not turn a successful business operation into a 500. It is
 * logged to stderr instead so it is not silently lost either.
 */
export async function writeAuditLog(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId ?? null,
        actorLabel: params.actorLabel,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId ?? null,
        result: params.result,
        metadata: params.metadata as any,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log", err, params);
  }
}
