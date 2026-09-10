/**
 * Every provider (local disk for development, S3-compatible for
 * production) implements this same shape, so nothing outside this folder
 * needs to know which one is active. Swapping AWS S3 for Cloudflare R2,
 * Backblaze B2, or MinIO later means changing the S3_ENDPOINT/credentials
 * env vars, not application code, since all four speak the same S3 API.
 */
export interface StorageProvider {
  /** Stores a buffer under `key` and returns nothing, the key is already known by the caller. */
  putObject(key: string, body: Buffer, contentType: string): Promise<void>;

  /** A time-limited URL the browser can GET the file from directly, or null if the provider doesn't support it (local dev). */
  getSignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string | null>;

  /** Reads the object back, used by the local provider's own download route and by the future document ingestion pipeline. */
  getObject(key: string): Promise<Buffer>;

  deleteObject(key: string): Promise<void>;
}
