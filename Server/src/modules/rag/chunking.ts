export interface Chunk {
  content: string;
  chunkIndex: number;
}

// Fixed-size chunking with overlap, splitting on paragraph boundaries
// where possible. This is a deliberately simple starting point (see
// README "AI Architecture", RAG QUALITY section), not a claim that it is
// the optimal chunking strategy. Semantic or structure-aware chunking
// (headings, clauses) would likely improve retrieval quality for legal
// documents specifically, and is a reasonable next iteration once real
// usage data shows where this falls short.
const CHUNK_SIZE_CHARS = 1200;
const CHUNK_OVERLAP_CHARS = 200;

export function chunkText(text: string): Chunk[] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!normalized) return [];

  const paragraphs = normalized.split(/\n{2,}/);
  const chunks: Chunk[] = [];
  let current = "";

  const pushCurrent = () => {
    const trimmed = current.trim();
    if (trimmed) chunks.push({ content: trimmed, chunkIndex: chunks.length });
    current = "";
  };

  for (const paragraph of paragraphs) {
    if ((current + "\n\n" + paragraph).length <= CHUNK_SIZE_CHARS) {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
      continue;
    }

    if (current) {
      pushCurrent();
      // Carry the tail of the previous chunk forward so a sentence split
      // across a chunk boundary still has surrounding context on both
      // sides.
      const overlap = chunks.at(-1)?.content.slice(-CHUNK_OVERLAP_CHARS) ?? "";
      current = overlap;
    }

    // A single paragraph longer than the chunk size on its own: split it
    // by raw character count rather than losing it.
    if (paragraph.length > CHUNK_SIZE_CHARS) {
      let remaining = paragraph;
      while (remaining.length > CHUNK_SIZE_CHARS) {
        chunks.push({ content: remaining.slice(0, CHUNK_SIZE_CHARS), chunkIndex: chunks.length });
        remaining = remaining.slice(CHUNK_SIZE_CHARS - CHUNK_OVERLAP_CHARS);
      }
      current = remaining;
    } else {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    }
  }

  pushCurrent();
  return chunks;
}
