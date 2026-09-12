import { z } from "zod";
import "dotenv/config";

// Fail fast: if a required environment variable is missing or malformed,
// the app should refuse to start rather than run with an undefined secret.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  // Only needed if your Postgres provider offers a separate pooled
  // connection string (e.g. Layerbase, Neon, Supabase). DATABASE_URL
  // should be the pooled string the app uses at runtime, DIRECT_URL the
  // unpooled string Prisma CLI commands (migrate, studio) use instead,
  // since schema-changing operations don't always play well through a
  // transaction-mode pooler. If your provider only gives you one
  // connection string, set both to the same value.
  DIRECT_URL: z.string().optional(),
  SESSION_COOKIE_NAME: z.string().default("myright_session"),
  CSRF_COOKIE_NAME: z.string().default("myright_csrf"),
  SESSION_TTL_DAYS: z.coerce.number().default(14),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:3000"),
  // Model names are env-configurable on purpose, Gemini's model lineup
  // changes fairly often. Verify these against
  // https://ai.google.dev/gemini-api/docs/models before deploying, the
  // defaults below are current as of this milestone but will go stale.
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  GEMINI_EMBEDDING_MODEL: z.string().default("gemini-embedding-001"),
  GEMINI_EMBEDDING_DIMENSIONS: z.coerce.number().default(768),
  STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),

  // Google OAuth, used only for a mediator to connect their calendar for
  // Meet link creation. Leave unset to develop without this feature,
  // routes that need it fail with a clear error rather than crashing at
  // startup.
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().optional(),

  // 32-byte key (as 64 hex chars) used to encrypt Google refresh tokens
  // at rest. Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ENCRYPTION_KEY: z.string().optional(),

  // WhatsApp via Baileys (see infrastructure/notifications/whatsapp.provider.ts).
  // Off by default, since it requires scanning a QR code to link a real
  // WhatsApp number, not just an env var, see that file and the README.
  WHATSAPP_ENABLED: z.coerce.boolean().default(false),
  WHATSAPP_AUTH_DIR: z.string().default("./whatsapp-auth"),

  APP_URL: z.string().url().default("http://localhost:3000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
