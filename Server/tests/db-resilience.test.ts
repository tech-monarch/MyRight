import { describe, expect, it, vi } from "vitest";
import {
  isTransientConnectionError,
  isUniqueConstraintError,
  withPoolDefaults,
  withReadRetry,
} from "../src/infrastructure/database/resilience";

const defaults = { connectionLimit: 5, poolTimeoutSeconds: 20, connectTimeoutSeconds: 15 };
const noSleep = async () => undefined;
const initErr = (errorCode: string) => Object.assign(new Error("boom"), { name: "PrismaClientInitializationError", errorCode });

describe("withPoolDefaults", () => {
  it("adds pool params and preserves credentials, host, port, db and sslmode", () => {
    const out = new URL(withPoolDefaults("postgres://avnadmin:s3cr%40t@h.example.com:11025/defaultdb?sslmode=require", defaults)!);
    expect(out.username).toBe("avnadmin");
    expect(out.password).toBe("s3cr%40t");
    expect(out.host).toBe("h.example.com:11025");
    expect(out.pathname).toBe("/defaultdb");
    expect(out.searchParams.get("sslmode")).toBe("require");
    expect(out.searchParams.get("connection_limit")).toBe("5");
    expect(out.searchParams.get("pool_timeout")).toBe("20");
    expect(out.searchParams.get("connect_timeout")).toBe("15");
  });
  it("never overrides values already in the URL", () => {
    const out = new URL(withPoolDefaults("postgres://u:p@h:1/d?connection_limit=2&pgbouncer=true", defaults)!);
    expect(out.searchParams.get("connection_limit")).toBe("2");
    expect(out.searchParams.get("pgbouncer")).toBe("true");
  });
  it("returns undefined for an unparseable URL without leaking it", () => {
    expect(withPoolDefaults("not a url", defaults)).toBeUndefined();
  });
});

describe("error classification", () => {
  it("treats connection-loss codes as transient, not pool timeouts or query errors", () => {
    for (const c of ["P1001", "P1002", "P1008", "P1017"]) expect(isTransientConnectionError(initErr(c))).toBe(true);
    expect(isTransientConnectionError({ code: "P2024" })).toBe(false);
    expect(isTransientConnectionError({ code: "P2002" })).toBe(false);
    expect(isTransientConnectionError(null)).toBe(false);
  });
  it("detects unique violations", () => {
    expect(isUniqueConstraintError({ code: "P2002" })).toBe(true);
    expect(isUniqueConstraintError({ code: "P1017" })).toBe(false);
  });
});

describe("withReadRetry", () => {
  it("recovers when a transient error clears", async () => {
    const op = vi.fn().mockRejectedValueOnce(initErr("P1017")).mockResolvedValue("ok");
    await expect(withReadRetry(op, { sleep: noSleep })).resolves.toBe("ok");
    expect(op).toHaveBeenCalledTimes(2);
  });
  it("is bounded: gives up after 3 attempts even if asked for more", async () => {
    const op = vi.fn().mockRejectedValue(initErr("P1017"));
    await expect(withReadRetry(op, { attempts: 50, sleep: noSleep })).rejects.toMatchObject({ errorCode: "P1017" });
    expect(op).toHaveBeenCalledTimes(3);
  });
  it("does not retry non-transient errors", async () => {
    const op = vi.fn().mockRejectedValue({ code: "P2002" });
    await expect(withReadRetry(op, { sleep: noSleep })).rejects.toMatchObject({ code: "P2002" });
    expect(op).toHaveBeenCalledTimes(1);
  });
});
