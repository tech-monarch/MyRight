import { beforeAll, describe, expect, it, vi } from "vitest";
import { createRequire } from "module";

// A tiny in-memory stand-in for the three tables the store touches.
const sessions = new Map<string, { creds: string | null }>();
const keys = new Map<string, string>();
const k = (s: string, t: string, i: string) => `${s}|${t}|${i}`;

vi.mock("../src/infrastructure/database/prisma", () => ({
  prisma: {
    whatsAppSession: {
      upsert: async ({ where, create }: any) => { if (!sessions.has(where.scopeKey)) sessions.set(where.scopeKey, { creds: create.creds ?? null }); },
      findUnique: async ({ where }: any) => sessions.get(where.scopeKey) ?? null,
      update: async ({ where, data }: any) => { sessions.get(where.scopeKey)!.creds = data.creds; },
      updateMany: async ({ where, data }: any) => { const s = sessions.get(where.scopeKey); if (s) s.creds = data.creds; },
    },
    whatsAppAuthKey: {
      findMany: async ({ where }: any) => where.keyId.in.filter((id: string) => keys.has(k(where.scopeKey, where.type, id))).map((id: string) => ({ keyId: id, value: keys.get(k(where.scopeKey, where.type, id)) })),
      upsert: async ({ where, create }: any) => { const w = where.scopeKey_type_keyId; keys.set(k(w.scopeKey, w.type, w.keyId), create.value); },
      deleteMany: async ({ where }: any) => { for (const key of [...keys.keys()]) if (key.startsWith(`${where.scopeKey}|`) && (!where.type || key.startsWith(`${where.scopeKey}|${where.type}|`)) && (!where.keyId || key.endsWith(`|${where.keyId}`))) keys.delete(key); },
    },
    $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
  },
}));

let store: typeof import("../src/infrastructure/notifications/whatsapp.authstate");
let baileys: any;
beforeAll(async () => {
  baileys = createRequire(import.meta.url)("@whiskeysockets/baileys");
  store = await import("../src/infrastructure/notifications/whatsapp.authstate");
});

describe("database-backed WhatsApp credentials (real Baileys data types)", () => {
  it("creates fresh credentials the first time, and reloads the SAME ones after a restart", async () => {
    const first = await store.useDbAuthState(baileys, "ch1");
    await first.saveCreds();
    const second = await store.useDbAuthState(baileys, "ch1"); // a "restart"
    expect(Buffer.from(second.state.creds.noiseKey.private).equals(Buffer.from(first.state.creds.noiseKey.private))).toBe(true);
    expect(second.state.creds.registrationId).toBe(first.state.creds.registrationId);
    expect(second.state.creds.signedIdentityKey.public).toBeInstanceOf(Uint8Array);
  });
  it("round-trips binary Signal keys and deletes them when asked", async () => {
    const { state } = await store.useDbAuthState(baileys, "ch1");
    const secret = new Uint8Array([1, 2, 3, 250, 251]);
    await state.keys.set({ "pre-key": { "7": { private: secret, public: secret } } });
    const got: any = await state.keys.get("pre-key", ["7", "8"]);
    expect(Buffer.from(got["7"].private).equals(Buffer.from(secret))).toBe(true);
    expect(got["8"]).toBeUndefined();
    await state.keys.set({ "pre-key": { "7": null } });
    expect(await state.keys.get("pre-key", ["7"])).toEqual({});
  });
  it("keeps different numbers completely separate", async () => {
    const a = await store.useDbAuthState(baileys, "ch-a");
    const b = await store.useDbAuthState(baileys, "ch-b");
    await a.state.keys.set({ session: { x: { v: 1 } } });
    expect(await b.state.keys.get("session", ["x"])).toEqual({});
  });
  it("clearing forgets the link so the next connect needs a fresh pairing", async () => {
    const a = await store.useDbAuthState(baileys, "ch-c");
    await a.saveCreds();
    await a.state.keys.set({ session: { x: { v: 1 } } });
    await store.clearAuthState("ch-c");
    expect(sessions.get("ch-c")!.creds).toBeNull();
    const again = await store.useDbAuthState(baileys, "ch-c");
    expect(again.state.creds.registered).toBeFalsy();
    expect(await again.state.keys.get("session", ["x"])).toEqual({});
  });
});
