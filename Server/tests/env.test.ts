import { describe, expect, it, vi } from "vitest";

async function loadEnv(value?: string) {
  vi.resetModules();
  vi.stubEnv("DATABASE_URL", "postgresql://localhost:5432/test");
  if (value === undefined) vi.stubEnv("WHATSAPP_ENABLED", "");
  else vi.stubEnv("WHATSAPP_ENABLED", value);
  return (await import("../src/config/env")).env.WHATSAPP_ENABLED;
}

describe("WHATSAPP_ENABLED parsing", () => {
  it('treats the text "false" as false (the old z.coerce.boolean made it true)', async () => {
    expect(await loadEnv("false")).toBe(false);
    expect(await loadEnv("0")).toBe(false);
    expect(await loadEnv("FALSE")).toBe(false);
  });
  it("treats true/1/yes/on as true", async () => {
    for (const v of ["true", "1", "yes", "ON", " True "]) expect(await loadEnv(v)).toBe(true);
  });
});
