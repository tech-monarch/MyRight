/**
 * Prisma's query builder does not support the `vector` column type or
 * pgvector's distance operators (`<=>`), every read or write that
 * touches an embedding column goes through $queryRaw/$executeRaw with
 * this literal format instead. See ingestion.service.ts and
 * retrieval.service.ts for the actual queries.
 */
export function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
