import { z } from "zod";
import "dotenv/config";

// Fail fast: if a required environment variable is missing or malformed,
// the app should refuse to start rather than run with an undefined secret.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  // DATABASE_URL is what the running app uses. On Aiven, point it at a
  // PgBouncer pool URI (Console > service > Connection pools) ONLY if the
  // service plan supports pooling (the free plan does not). DIRECT_URL is the
  // plain service URI that Prisma CLI commands (migrate deploy/status,
  // studio) use, because the schema engine does not work through PgBouncer.
  // Without a pooler, set both to the same value.
  DIRECT_URL: z.string().optional(),
  // Max Postgres connections this process may open. Only applied when
  // DATABASE_URL does not already contain connection_limit. Keep it small
  // enough that (instances x this value) stays well under the database's
  // max_connections (20 on Aiven's free plan), allowing for deploy overlap.
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(50).default(5),
  SESSION_COOKIE_NAME: z.string().default("myright_session"),
  CSRF_COOKIE_NAME: z.string().default("myright_csrf"),
  SESSION_TTL_DAYS: z.coerce.number().default(14),
  // Comma-separated list of origins allowed to call this API with
  // credentials (cookies), e.g. your local dev frontend and your
  // deployed frontend both need to be listed:
  //   CLIENT_ORIGIN=http://localhost:3000,https://your-app.vercel.app
  CLIENT_ORIGIN: z
    .string()
    .default("http://localhost:3000")
    .transform((value) => value.split(",").map((origin) => origin.trim()).filter(Boolean))
    .refine((origins) => origins.every((origin) => z.string().url().safeParse(origin).success), {
      message: "CLIENT_ORIGIN must be a comma-separated list of valid URLs",
    }),
  // Model names are env-configurable on purpose, Gemini's model lineup
  // changes fairly often. Verify these against
  // https://ai.google.dev/gemini-api/docs/models before deploying, the
  // defaults below are current as of this milestone but will go stale.
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-3.5-flash"),
  GEMINI_EMBEDDING_MODEL: z.string().default("gemini-embedding-001"),
  GEMINI_EMBEDDING_DIMENSIONS: z.coerce.number().default(768),
  STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),

  // Daily.co, used for embedded mediation video (see
  // infrastructure/video/daily.provider.ts). A single platform-level API
  // key, unlike the old Google Meet integration this replaces, no
  // per-mediator OAuth connection needed. Leave unset to develop without
  // video scheduling, session creation fails with a clear error rather
  // than crashing at startup.
  DAILY_API_KEY: z.string().optional(),
  // Your Daily subdomain, e.g. "myright" for rooms at myright.daily.co.
  // Only used to validate/construct URLs, not required for API calls
  // themselves (the API key alone identifies the account).
  DAILY_DOMAIN: z.string().optional(),

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
