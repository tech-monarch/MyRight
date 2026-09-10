import { promises as fs } from "fs";
import path from "path";
import type { StorageProvider } from "@/infrastructure/storage/storage.provider";

// Development-only. Never used in production, where STORAGE_PROVIDER=s3
// points at real object storage. Kept intentionally minimal, this exists
// so `npm run dev` works with zero external setup, not as a production
// storage option.
const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

export class LocalStorageProvider implements StorageProvider {
  async putObject(key: string, body: Buffer): Promise<void> {
    const filePath = path.join(UPLOAD_ROOT, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, body);
  }

  async getSignedDownloadUrl(): Promise<string | null> {
    // No signed-URL concept for local disk, the documents controller
    // falls back to streaming the file through its own authenticated
    // download route when this returns null.
    return null;
  }

  async getObject(key: string): Promise<Buffer> {
    return fs.readFile(path.join(UPLOAD_ROOT, key));
  }

  async deleteObject(key: string): Promise<void> {
    await fs.rm(path.join(UPLOAD_ROOT, key), { force: true });
  }
}
