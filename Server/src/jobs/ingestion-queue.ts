import { ingestDocument } from "@/modules/rag/ingestion.service";

/**
 * A deliberately minimal job queue: an in-memory array processed one job
 * at a time by a loop that never blocks the HTTP response. This is
 * enough to keep uploads fast and give a genuinely async pipeline for a
 * single-instance deployment.
 *
 * Known limitation, documented rather than hidden: jobs live only in
 * process memory. A server restart while a job is queued silently drops
 * it (the document stays at status UPLOADED forever, a support/product
 * concern to know about, not a data-loss concern since the file itself
 * is already safely in storage). Before running more than one API
 * instance, or before this matters enough to fix, swap this for pg-boss
 * (a job queue backed by Postgres, which this project already requires,
 * no new infrastructure) or BullMQ (needs Redis) behind the same
 * `enqueueIngestion` function signature, so nothing outside this file
 * has to change.
 */
const queue: string[] = [];
let processing = false;

export function enqueueIngestion(documentId: string): void {
  queue.push(documentId);
  void processQueue();
}

async function processQueue(): Promise<void> {
  if (processing) return;
  processing = true;
  try {
    while (queue.length > 0) {
      const documentId = queue.shift()!;
      await ingestDocument(documentId);
    }
  } finally {
    processing = false;
  }
}
