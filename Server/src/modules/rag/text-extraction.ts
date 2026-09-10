import mammoth from "mammoth";

export interface ExtractedText {
  text: string;
  /** Present for PDFs, used to give chunks a pageNumber for citations. */
  pageBreaks?: number[];
}

/**
 * OCR for scanned images/PDFs is intentionally not implemented here (see
 * README "AI Limitations"). An uploaded JPG/PNG is still stored and
 * downloadable as evidence, it just is not searchable by the AI
 * assistant yet, ingestDocument() below marks it READY with zero chunks
 * rather than failing the upload.
 */
export async function extractText(buffer: Buffer, mimeType: string): Promise<ExtractedText | null> {
  if (mimeType === "application/pdf") {
    // Lazy import: pdf-parse reads a bundled test PDF at module load time
    // in some versions if imported eagerly at the top of a file with no
    // guard, importing it only when actually needed avoids that surprise.
    const pdfParse = (await import("pdf-parse")).default;
    const result = await pdfParse(buffer);
    return { text: result.text };
  }

  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value };
  }

  if (mimeType === "application/msword") {
    // Legacy .doc binary format, mammoth only handles .docx. Flagged as a
    // known gap rather than guessed at, see README "AI Limitations".
    return null;
  }

  // Images (jpg/png): no text to extract without OCR.
  return null;
}
