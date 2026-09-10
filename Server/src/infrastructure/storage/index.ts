import { env } from "@/config/env";
import type { StorageProvider } from "@/infrastructure/storage/storage.provider";
import { LocalStorageProvider } from "@/infrastructure/storage/local.provider";
import { S3StorageProvider } from "@/infrastructure/storage/s3.provider";

let instance: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (!instance) {
    instance = env.STORAGE_PROVIDER === "s3" ? new S3StorageProvider() : new LocalStorageProvider();
  }
  return instance;
}
