import QRCode from "qrcode";
import { env } from "@/config/env";
import { prisma } from "@/infrastructure/database/prisma";
import { AppError } from "@/utils/AppError";
import { isPlausiblePhone, normalizePhone } from "@/utils/phone";
import type { NotificationResult } from "@/infrastructure/notifications/notification.provider";
import { clearAuthState, useDbAuthState } from "@/infrastructure/notifications/whatsapp.authstate";

export type WhatsAppStatus = "disabled" | "disconnected" | "connecting" | "awaiting_scan" | "connected";
export type LinkMode = "code" | "qr";

export const PLATFORM_SCOPE = "platform";

/**
 * Baileys is intentionally NOT imported at the top of this file. It is an
 * optionalDependency, so it may not be installed in every environment;
 * loading it lazily means the server still boots with WHATSAPP_ENABLED=false.
 */
function loadBaileys() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const baileys = require("@whiskeysockets/baileys");
  return {
    makeWASocket: baileys.default ?? baileys.makeWASocket,
    DisconnectReason: baileys.DisconnectReason,
    fetchLatestBaileysVersion: baileys.fetchLatestBaileysVersion,
    initAuthCreds: baileys.initAuthCreds,
    BufferJSON: baileys.BufferJSON,
    proto: baileys.proto,
  };
}

const MAX_RECONNECTS = 8;

/**
 * One live WhatsApp Web connection for one number ("scope"): either the
 * platform default ("platform") or a single courthouse (its id).
 *
 * Reminders that matter before touching this:
 * - There is no API key. Authenticity comes from linking a real WhatsApp
 *   account as a "linked device", by pairing code or QR scan. Whoever's
 *   phone does that IS the sending number.
 * - This is WhatsApp's unofficial multi-device protocol, against WhatsApp's
 *   terms of service, with a real risk of the linked number being banned.
 *   Use a dedicated number, not a personal one you can't lose.
 * - Credentials live in Postgres (whatsapp.authstate.ts) so they survive
 *   Render deploys.
 */
class WhatsAppRunner {
  status: WhatsAppStatus = env.WHATSAPP_ENABLED ? "disconnected" : "disabled";
  qrDataUrl: string | null = null;
  pairingCode: string | null = null;
  connectedNumber: string | null = null;

  private sock: any = null;
  private mode: LinkMode = "code";
  private phone: string | null = null;
  private pairingRequested = false;
  private reconnects = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private generation = 0;

  constructor(readonly scopeKey: string) {}

  getStatus() {
    return {
      status: this.status,
      qrDataUrl: this.qrDataUrl,
      pairingCode: this.pairingCode,
      connectedNumber: this.connectedNumber,
    };
  }

  isReady() {
    return this.status === "connected";
  }

  /** `force` restarts pairing (e.g. the code expired); without it an already-active connection is left alone. */
  async start(opts: { mode?: LinkMode; phone?: string | null; force?: boolean } = {}) {
    if (this.status === "disabled") return;
    if (opts.mode) this.mode = opts.mode;
    if (opts.phone !== undefined) this.phone = opts.phone;
    if (!opts.force && (this.status === "connected" || this.status === "connecting" || this.status === "awaiting_scan")) return;
    this.reconnects = 0;
    await this.connect();
  }

  private teardownSocket() {
    this.generation++; // makes any in-flight events from the old socket be ignored
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    try {
      this.sock?.ev?.removeAllListeners?.("connection.update");
      this.sock?.end?.(undefined);
    } catch {
      /* already closed */
    }
    this.sock = null;
  }

  private async connect(): Promise<void> {
    this.teardownSocket();
    const generation = this.generation;
    this.status = "connecting";
    this.qrDataUrl = null;
    this.pairingCode = null;
    this.pairingRequested = false;

    let baileys: ReturnType<typeof loadBaileys>;
    try {
      baileys = loadBaileys();
    } catch {
      this.status = "disconnected";
      console.error("WhatsApp is enabled but @whiskeysockets/baileys isn't installed (npm install @whiskeysockets/baileys).");
      return;
    }

    try {
      const { state, saveCreds } = await useDbAuthState(baileys, this.scopeKey);
      const { version } = await baileys.fetchLatestBaileysVersion();
      if (generation !== this.generation) return; // superseded while loading

      const sock = baileys.makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        browser: ["MyRight", "Chrome", "1.0.0"],
      });
      this.sock = sock;
      sock.ev.on("creds.update", saveCreds);

      sock.ev.on("connection.update", async (update: any) => {
        if (generation !== this.generation) return;
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          if (this.mode === "code" && this.phone && !state.creds.registered) {
            // A pairing code is requested once per socket, once WhatsApp is ready for it.
            if (!this.pairingRequested) {
              this.pairingRequested = true;
              try {
                this.pairingCode = await sock.requestPairingCode(this.phone);
                this.status = "awaiting_scan";
              } catch (err) {
                this.pairingRequested = false;
                console.error(`WhatsApp pairing code failed (${this.scopeKey})`, err instanceof Error ? err.message : "unknown");
              }
            }
          } else {
            this.qrDataUrl = await QRCode.toDataURL(qr);
            this.status = "awaiting_scan";
          }
        }

        if (connection === "open") {
          this.status = "connected";
          this.qrDataUrl = null;
          this.pairingCode = null;
          this.reconnects = 0;
          this.connectedNumber = sock.user?.id?.split(":")[0]?.split("@")[0] ?? null;
          console.log(`WhatsApp connected (${this.scopeKey})`);
        }

        if (connection === "close") {
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          this.connectedNumber = null;
          if (statusCode === baileys.DisconnectReason?.loggedOut) {
            // Unlinked from the phone: the saved credentials are now useless.
            console.log(`WhatsApp logged out (${this.scopeKey}), a new pairing is required.`);
            this.status = "disconnected";
            this.qrDataUrl = null;
            this.pairingCode = null;
            await clearAuthState(this.scopeKey).catch(() => undefined);
            return;
          }
          this.scheduleReconnect();
        }
      });
    } catch (err) {
      console.error(`WhatsApp start failed (${this.scopeKey})`, err instanceof Error ? err.message : "unknown");
      this.scheduleReconnect();
    }
  }

  /** Bounded exponential backoff: gives up after MAX_RECONNECTS rather than hammering WhatsApp forever. */
  private scheduleReconnect() {
    this.status = "disconnected";
    if (this.reconnects >= MAX_RECONNECTS) {
      console.error(`WhatsApp (${this.scopeKey}) gave up reconnecting; reconnect from the dashboard.`);
      return;
    }
    const delay = Math.min(30_000, 1_000 * 2 ** this.reconnects);
    this.reconnects++;
    this.timer = setTimeout(() => void this.connect(), delay);
  }

  async sendMessage(to: string, message: string): Promise<NotificationResult> {
    if (this.status !== "connected" || !this.sock) {
      return { sent: false, error: `WhatsApp is not connected (status: ${this.status}).` };
    }
    try {
      await this.sock.sendMessage(`${to.replace(/\D/g, "")}@s.whatsapp.net`, { text: message });
      return { sent: true };
    } catch (err) {
      return { sent: false, error: err instanceof Error ? err.message : "Unknown WhatsApp send error" };
    }
  }

  /** Unlinks the device and forgets the credentials. */
  async unlink() {
    const sock = this.sock;
    await Promise.resolve(sock?.logout?.()).catch(() => undefined);
    this.teardownSocket();
    this.status = env.WHATSAPP_ENABLED ? "disconnected" : "disabled";
    this.qrDataUrl = null;
    this.pairingCode = null;
    this.connectedNumber = null;
    await clearAuthState(this.scopeKey).catch(() => undefined);
  }
}

class WhatsAppManager {
  private runners = new Map<string, WhatsAppRunner>();

  get enabled() {
    return env.WHATSAPP_ENABLED;
  }

  private runner(scopeKey: string) {
    let r = this.runners.get(scopeKey);
    if (!r) {
      r = new WhatsAppRunner(scopeKey);
      this.runners.set(scopeKey, r);
    }
    return r;
  }

  /** Called once at boot: seeds the default number, then reconnects every number that was linked before. */
  async boot() {
    if (!this.enabled) return;
    try {
      if (env.WHATSAPP_DEFAULT_NUMBER) {
        const existing = await prisma.whatsAppSession.findUnique({ where: { scopeKey: PLATFORM_SCOPE } });
        if (!existing) {
          await prisma.whatsAppSession.create({
            data: { scopeKey: PLATFORM_SCOPE, phoneNumber: normalizePhone(env.WHATSAPP_DEFAULT_NUMBER) },
          });
        } else if (!existing.phoneNumber) {
          await prisma.whatsAppSession.update({
            where: { scopeKey: PLATFORM_SCOPE },
            data: { phoneNumber: normalizePhone(env.WHATSAPP_DEFAULT_NUMBER) },
          });
        }
      }
      const linked = await prisma.whatsAppSession.findMany({ where: { creds: { not: null } }, select: { scopeKey: true } });
      for (const { scopeKey } of linked) void this.runner(scopeKey).start();
    } catch (err) {
      console.error("WhatsApp boot failed", err instanceof Error ? err.message : "unknown");
    }
  }

  async getNumber(scopeKey: string): Promise<string | null> {
    const row = await prisma.whatsAppSession.findUnique({ where: { scopeKey }, select: { phoneNumber: true } });
    return row?.phoneNumber ?? null;
  }

  async getStatus(scopeKey: string) {
    return { ...this.runner(scopeKey).getStatus(), number: await this.getNumber(scopeKey), enabled: this.enabled };
  }

  /**
   * Sets the number this scope should send from. Changing it to a different
   * number unlinks whatever was linked before, since credentials belong to
   * one specific WhatsApp account.
   */
  async setNumber(scopeKey: string, raw: string) {
    if (!isPlausiblePhone(raw)) throw AppError.badRequest("Enter a valid phone number, including the country code.");
    const number = normalizePhone(raw);
    const current = await this.getNumber(scopeKey);
    if (current && current !== number) await this.runner(scopeKey).unlink();
    await prisma.whatsAppSession.upsert({
      where: { scopeKey },
      create: { scopeKey, phoneNumber: number },
      update: { phoneNumber: number },
    });
    return number;
  }

  /** Starts linking. "code" needs a number first; "qr" does not. */
  async connect(scopeKey: string, mode: LinkMode) {
    if (!this.enabled) throw AppError.badRequest("WhatsApp is turned off on this server (WHATSAPP_ENABLED).");
    const number = await this.getNumber(scopeKey);
    if (mode === "code" && !number) throw AppError.badRequest("Set the WhatsApp number first.");
    await this.runner(scopeKey).start({ mode, phone: number, force: true });
    return this.getStatus(scopeKey);
  }

  async disconnect(scopeKey: string) {
    await this.runner(scopeKey).unlink();
    return this.getStatus(scopeKey);
  }

  /** A courthouse going back to the platform default: unlink and forget its own number. */
  async removeOverride(scopeKey: string) {
    await this.runner(scopeKey).unlink();
    await prisma.whatsAppSession.deleteMany({ where: { scopeKey } });
    this.runners.delete(scopeKey);
  }

  /**
   * Sends from the courthouse's own number if it has one connected,
   * otherwise from the platform default.
   */
  async sendFor(courthouseId: string | null | undefined, to: string, message: string): Promise<NotificationResult> {
    if (!this.enabled) return { sent: false, error: "WhatsApp is turned off on this server." };
    const own = courthouseId ? this.runners.get(courthouseId) : undefined;
    if (own?.isReady()) return own.sendMessage(to, message);
    const platform = this.runners.get(PLATFORM_SCOPE);
    if (platform?.isReady()) return platform.sendMessage(to, message);
    return { sent: false, error: "No WhatsApp number is connected." };
  }
}

export const whatsAppManager = new WhatsAppManager();
