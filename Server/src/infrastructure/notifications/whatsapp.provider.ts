import { join } from "path";
import QRCode from "qrcode";
import { env } from "@/config/env";
import type { NotificationProvider, NotificationResult } from "@/infrastructure/notifications/notification.provider";

// Baileys is CommonJS with a slightly unusual export shape, requiring it
// this way (rather than a normal ESM-style default import) avoids a
// "makeWASocket is not a function" surprise depending on the TS/module
// interop settings, cheaper than debugging that twice.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const baileys = require("@whiskeysockets/baileys");
const makeWASocket = baileys.default ?? baileys.makeWASocket;
const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = baileys;

export type WhatsAppStatus = "disabled" | "disconnected" | "connecting" | "awaiting_scan" | "connected";

/**
 * A real, live WhatsApp Web connection, not a stateless API client. This
 * is the main thing to understand about Baileys before touching this
 * file:
 *
 * - There is no API key. Authenticity comes from linking a real WhatsApp
 *   number as a "linked device" by scanning a QR code, exactly like
 *   linking WhatsApp Web in a browser. Whoever's phone scans the code is
 *   the number this courthouse's notifications will be sent from.
 * - The credentials from that pairing are written to disk under
 *   WHATSAPP_AUTH_DIR (default ./whatsapp-auth) and must persist across
 *   restarts, deleting that folder means re-scanning the QR code.
 * - This uses WhatsApp's unofficial multi-device protocol, not
 *   WhatsApp's official Business API. It works and is widely used, but
 *   it is against WhatsApp's terms of service, and carries a real if
 *   small risk of the linked number being flagged or banned. That is a
 *   product/business decision to make with eyes open, not something to
 *   route around technically.
 * - The socket connection is a singleton process-wide, only one WhatsApp
 *   number is connected per running backend instance.
 */
class WhatsAppProvider implements NotificationProvider {
  private sock: any = null;
  private status: WhatsAppStatus = env.WHATSAPP_ENABLED ? "disconnected" : "disabled";
  private qrDataUrl: string | null = null;
  private connectedNumber: string | null = null;
  private starting: Promise<void> | null = null;

  getStatus() {
    return { status: this.status, qrDataUrl: this.qrDataUrl, connectedNumber: this.connectedNumber };
  }

  isReady(): boolean {
    return this.status === "connected";
  }

  /** Idempotent: safe to call repeatedly (e.g. from an admin "connect" button), only actually starts a socket once. */
  async start(): Promise<void> {
    if (this.status === "disabled") return;
    if (this.status === "connected" || this.status === "connecting" || this.status === "awaiting_scan") return;
    if (this.starting) return this.starting;

    this.starting = this.connect();
    await this.starting;
    this.starting = null;
  }

  private async connect(): Promise<void> {
    this.status = "connecting";
    const authDir = join(process.cwd(), env.WHATSAPP_AUTH_DIR);
    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    const { version } = await fetchLatestBaileysVersion();

    this.sock = makeWASocket({
      version,
      auth: state,
      // Baileys prints its own QR to the terminal by default, turned off
      // here since the admin UI renders it instead (see whatsapp.routes.ts).
      printQRInTerminal: false,
    });

    this.sock.ev.on("creds.update", saveCreds);

    this.sock.ev.on("connection.update", async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.status = "awaiting_scan";
        this.qrDataUrl = await QRCode.toDataURL(qr);
      }

      if (connection === "open") {
        this.status = "connected";
        this.qrDataUrl = null;
        this.connectedNumber = this.sock?.user?.id?.split(":")[0] ?? null;
        console.log(`WhatsApp connected (${this.connectedNumber})`);
      }

      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const loggedOut = statusCode === DisconnectReason?.loggedOut;
        this.status = "disconnected";
        this.connectedNumber = null;

        if (loggedOut) {
          // The device was unlinked from the phone side, a new QR scan
          // is required, no point auto-reconnecting.
          console.log("WhatsApp logged out, reconnect requires a new QR scan.");
        } else {
          console.log("WhatsApp connection closed, reconnecting...");
          void this.connect();
        }
      }
    });
  }

  async sendMessage(to: string, message: string): Promise<NotificationResult> {
    if (this.status !== "connected" || !this.sock) {
      return { sent: false, error: `WhatsApp is not connected (status: ${this.status}).` };
    }
    try {
      const jid = `${to.replace(/\D/g, "")}@s.whatsapp.net`;
      await this.sock.sendMessage(jid, { text: message });
      return { sent: true };
    } catch (err) {
      return { sent: false, error: err instanceof Error ? err.message : "Unknown WhatsApp send error" };
    }
  }

  async disconnect(): Promise<void> {
    await this.sock?.logout().catch(() => undefined);
    this.sock = null;
    this.status = env.WHATSAPP_ENABLED ? "disconnected" : "disabled";
    this.qrDataUrl = null;
    this.connectedNumber = null;
  }
}

export const whatsAppProvider = new WhatsAppProvider();
