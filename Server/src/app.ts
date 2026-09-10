import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { randomUUID } from "crypto";
import { env } from "@/config/env";
import { authRouter } from "@/modules/auth/auth.routes";
import { disputesRouter } from "@/modules/disputes/disputes.routes";
import { adminRouter } from "@/modules/admin/admin.routes";
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler";
import { apiRateLimiter } from "@/middleware/rateLimit";

const app = express();

// Request ID + structured logging first, so every later log line (and the
// error handler) can be tied back to one request.
app.use(
  pinoHttp({
    genReqId: (req) => req.headers["x-request-id"]?.toString() ?? randomUUID(),
    redact: ["req.headers.cookie", "req.headers.authorization"],
  })
);

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true, // required for the browser to send/receive the session cookie
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(apiRateLimiter);

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/health/db", async (_req, res) => {
  const { prisma } = await import("@/infrastructure/database/prisma");
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "unavailable" });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/disputes", disputesRouter);
app.use("/api/admin", adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`MyRight API listening on port ${env.PORT} (${env.NODE_ENV})`);
});

export { app };
