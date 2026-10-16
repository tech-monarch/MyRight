import { prisma } from "@/infrastructure/database/prisma";

/**
 * Baileys' login credentials and Signal keys, stored in Postgres instead of
 * on disk. Render's disk is wiped on every deploy, which with the default
 * file-based store would mean re-linking the phone after every release.
 *
 * `baileys` is passed in (rather than imported) because the package is an
 * optional dependency that is loaded lazily, see whatsapp.provider.ts.
 *
 * Implements the same { state, saveCreds } contract as Baileys'
 * useMultiFileAuthState, with one row per key.
 */
interface BaileysAuthPrimitives {
  initAuthCreds: () => any;
  BufferJSON: { replacer: any; reviver: any };
  proto: { Message: { AppStateSyncKeyData: { fromObject: (o: any) => any } } };
}

const CHUNK = 100;

export async function useDbAuthState(baileys: BaileysAuthPrimitives, scopeKey: string) {
  const { BufferJSON } = baileys;

  await prisma.whatsAppSession.upsert({ where: { scopeKey }, create: { scopeKey }, update: {} });
  const row = await prisma.whatsAppSession.findUnique({ where: { scopeKey }, select: { creds: true } });
  const creds = row?.creds ? JSON.parse(row.creds, BufferJSON.reviver) : baileys.initAuthCreds();

  const keys = {
    get: async (type: string, ids: string[]) => {
      const rows = await prisma.whatsAppAuthKey.findMany({ where: { scopeKey, type, keyId: { in: ids } } });
      const out: Record<string, unknown> = {};
      for (const r of rows) {
        let value = JSON.parse(r.value, BufferJSON.reviver);
        if (type === "app-state-sync-key" && value) {
          value = baileys.proto.Message.AppStateSyncKeyData.fromObject(value);
        }
        out[r.keyId] = value;
      }
      return out;
    },
    set: async (data: Record<string, Record<string, unknown> | undefined>) => {
      const ops: ReturnType<typeof prisma.whatsAppAuthKey.upsert | typeof prisma.whatsAppAuthKey.deleteMany>[] = [];
      for (const type of Object.keys(data)) {
        const entries = data[type] ?? {};
        for (const keyId of Object.keys(entries)) {
          const value = entries[keyId];
          if (value === null || value === undefined) {
            ops.push(prisma.whatsAppAuthKey.deleteMany({ where: { scopeKey, type, keyId } }));
          } else {
            const serialized = JSON.stringify(value, BufferJSON.replacer);
            ops.push(
              prisma.whatsAppAuthKey.upsert({
                where: { scopeKey_type_keyId: { scopeKey, type, keyId } },
                create: { scopeKey, type, keyId, value: serialized },
                update: { value: serialized },
              })
            );
          }
        }
      }
      // Chunked so a big initial sync doesn't become one enormous transaction.
      for (let i = 0; i < ops.length; i += CHUNK) {
        await prisma.$transaction(ops.slice(i, i + CHUNK) as any);
      }
    },
  };

  return {
    state: { creds, keys },
    saveCreds: async () => {
      await prisma.whatsAppSession.update({
        where: { scopeKey },
        data: { creds: JSON.stringify(creds, BufferJSON.replacer) },
      });
    },
  };
}

/** Forgets the link entirely: the next connect needs a fresh pairing. */
export async function clearAuthState(scopeKey: string) {
  await prisma.$transaction([
    prisma.whatsAppAuthKey.deleteMany({ where: { scopeKey } }),
    prisma.whatsAppSession.updateMany({ where: { scopeKey }, data: { creds: null } }),
  ]);
}
