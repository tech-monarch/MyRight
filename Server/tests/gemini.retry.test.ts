import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

let GeminiProvider: typeof import("../src/infrastructure/ai/gemini.provider").GeminiProvider;

beforeAll(async () => {
  vi.stubEnv("DATABASE_URL", "postgresql://localhost:5432/test");
  vi.stubEnv("GEMINI_API_KEY", "test-key");
  vi.stubEnv("GEMINI_MODEL", "primary-model");
  vi.stubEnv("GEMINI_FALLBACK_MODEL", "fallback-model");
  vi.stubEnv("GEMINI_RETRY_BASE_MS", "1");
  vi.resetModules();
  ({ GeminiProvider } = await import("../src/infrastructure/ai/gemini.provider"));
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});
afterEach(() => vi.unstubAllGlobals());

const ok = () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "hi" }] } }] }), { status: 200 });
const fail = (status: number) => new Response("{}", { status });
const gen = () => new GeminiProvider().generateText({ systemPrompt: "s", userPrompt: "u" });

describe("Gemini resilience", () => {
  it("retries a 503 and succeeds", async () => {
    const f = vi.fn().mockResolvedValueOnce(fail(503)).mockResolvedValueOnce(ok());
    vi.stubGlobal("fetch", f);
    await expect(gen()).resolves.toBe("hi");
    expect(f).toHaveBeenCalledTimes(2);
  });
  it("does not retry a 400/403", async () => {
    const f = vi.fn().mockResolvedValue(fail(403));
    vi.stubGlobal("fetch", f);
    await expect(gen()).rejects.toMatchObject({ statusCode: 502 });
    expect(f).toHaveBeenCalledTimes(1);
  });
  it("is bounded, then tries the fallback model once", async () => {
    const f = vi.fn().mockResolvedValue(fail(503));
    vi.stubGlobal("fetch", f);
    await expect(gen()).rejects.toMatchObject({ statusCode: 502 });
    expect(f).toHaveBeenCalledTimes(6); // 3 primary + 3 fallback, no more
    expect(String(f.mock.calls[3]?.[0])).toContain("fallback-model");
  });
  it("uses the fallback when it answers", async () => {
    const f = vi.fn().mockResolvedValueOnce(fail(503)).mockResolvedValueOnce(fail(503)).mockResolvedValueOnce(fail(503)).mockResolvedValueOnce(ok());
    vi.stubGlobal("fetch", f);
    await expect(gen()).resolves.toBe("hi");
  });
  it("retries network errors/timeouts", async () => {
    const f = vi.fn().mockRejectedValueOnce(new TypeError("fetch failed")).mockResolvedValueOnce(ok());
    vi.stubGlobal("fetch", f);
    await expect(gen()).resolves.toBe("hi");
  });
});
