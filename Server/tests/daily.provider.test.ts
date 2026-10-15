import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

let dailyProvider: typeof import("../src/infrastructure/video/daily.provider");

beforeAll(async () => {
  vi.stubEnv("DATABASE_URL", "postgresql://localhost:5432/test");
  vi.stubEnv("DAILY_API_KEY", "test-api-key");
  vi.resetModules();
  dailyProvider = await import("@/infrastructure/video/daily.provider");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

afterAll(() => {
  vi.unstubAllEnvs();
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Daily.co response handling", () => {
  it("returns a room only when the response has a valid name and URL", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ name: "room-1", url: "https://myright.daily.co/room-1" }))
    );

    await expect(
      dailyProvider.createSessionRoom({
        disputeId: "dispute-1",
        scheduledStart: new Date("2026-10-15T10:00:00.000Z"),
        scheduledEnd: new Date("2026-10-15T11:00:00.000Z"),
      })
    ).resolves.toEqual({ name: "room-1", url: "https://myright.daily.co/room-1" });

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ name: "room-2" })));
    await expect(
      dailyProvider.createSessionRoom({
        disputeId: "dispute-1",
        scheduledStart: new Date("2026-10-15T10:00:00.000Z"),
        scheduledEnd: new Date("2026-10-15T11:00:00.000Z"),
      })
    ).rejects.toThrow("invalid response");
  });

  it("maps Daily's ISO join time and duration to attendance timestamps", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          total_count: 2,
          data: [
            { userName: "Mediator", joinTime: "2026-10-14T10:00:00.000Z", duration: 90 },
            { joinTime: "2026-10-14T10:05:00.000Z" },
          ],
        })
      )
    );

    await expect(dailyProvider.getRoomPresence("room-1")).resolves.toEqual([
      {
        participantName: "Mediator",
        joinedAt: new Date("2026-10-14T10:00:00.000Z"),
        leftAt: new Date("2026-10-14T10:01:30.000Z"),
        durationSec: 90,
      },
      {
        participantName: "Unknown participant",
        joinedAt: new Date("2026-10-14T10:05:00.000Z"),
        leftAt: null,
        durationSec: null,
      },
    ]);
  });

  it("rejects malformed presence payloads and failed HTTP responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ data: [{ joinTime: 1 }] })));
    await expect(dailyProvider.getRoomPresence("room-1")).rejects.toThrow("invalid response");

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ error: "unavailable" }, 503)));
    await expect(dailyProvider.getRoomPresence("room-1")).rejects.toThrow("temporarily unavailable");
  });
});
