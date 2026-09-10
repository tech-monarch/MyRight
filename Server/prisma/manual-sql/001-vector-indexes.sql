-- Run this once, after `prisma migrate dev` has created the
-- document_chunks and knowledge_chunks tables. Prisma's schema language
-- has no way to express a vector index with a specific operator class, so
-- this lives here instead of in a generated migration.
--
-- HNSW is used over IVFFlat because it does not require a training step
-- (IVFFlat's index quality depends on being built after a representative
-- amount of data already exists, which does not fit a system that starts
-- empty and grows continuously). HNSW costs somewhat more to build and
-- more memory, an acceptable trade for a knowledge base and per-dispute
-- document set of the size this product expects.

CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
  ON document_chunks USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_idx
  ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);
