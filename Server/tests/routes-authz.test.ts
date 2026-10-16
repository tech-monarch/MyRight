import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { AddressInfo } from "net";
import type { Server } from "http";

// Whoever the "session" resolves to for the current test.
let current: { role: string; permissions: string[]; courthouseId: string | null } | null = null;

vi.mock("../src/infrastructure/database/prisma", () => ({
  prisma: {
    session: {
      findUnique: async () =>
        current && {
          expiresAt: new Date(Date.now() + 60_000),
          user: { id: "u1", status: "ACTIVE", name: "Tester", mustChangePassword: false, ...current },
        },
    },
  },
}));

let server: Server;
let base = "";

beforeAll(async () => {
  vi.stubEnv("DATABASE_URL", "postgresql://localhost:5432/test");
  vi.resetModules();
  const express = (await import("express")).default;
  const cookieParser = (await import("cookie-parser")).default;
  const { adminRouter } = await import("../src/modules/admin/admin.routes");
  const { platformRouter } = await import("../src/modules/platform/platform.routes");
  const { courthouseWhatsappRouter, platformWhatsappRouter } = await import("../src/modules/admin/whatsapp.routes");
  const { errorHandler } = await import("../src/middleware/errorHandler");

  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/admin", adminRouter);
  app.use("/api/admin/whatsapp", courthouseWhatsappRouter);
  app.use("/api/platform", platformRouter);
  app.use("/api/platform/whatsapp", platformWhatsappRouter);
  app.use(errorHandler);
  server = app.listen(0);
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(() => server.close());
beforeEach(() => (current = null));

const as = (role: string, permissions: string[] = [], courthouseId: string | null = "ch1") => (current = { role, permissions, courthouseId });

async function call(method: string, path: string): Promise<number> {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { cookie: "myright_session=t; myright_csrf=c", "x-csrf-token": "c", "content-type": "application/json" },
    body: method === "GET" ? undefined : "{}",
  });
  return res.status;
}
// "Let through" = got past authentication AND authorization. What the handler then does
// (validation 400, or a 500 because the database is mocked) is irrelevant here.
const letThrough = (s: number) => s !== 401 && s !== 403;

describe("courthouse admin area: staff only get what they were delegated", () => {
  const doors: [string, string, string[]][] = [
    ["GET", "/api/admin/lawyers", ["MANAGE_LAWYERS", "ASSIGN_CASES"]],
    ["POST", "/api/admin/lawyers", ["MANAGE_LAWYERS"]],
    ["POST", "/api/admin/lawyers/x/status", ["MANAGE_LAWYERS"]],
    ["POST", "/api/admin/lawyers/x/reset-password", ["MANAGE_LAWYERS"]],
    ["POST", "/api/admin/lawyers/x/assignments", ["ASSIGN_CASES"]],
    ["DELETE", "/api/admin/assignments/x", ["ASSIGN_CASES"]],
    ["GET", "/api/admin/cases", ["VIEW_CASES", "ASSIGN_CASES"]],
  ];
  for (const [method, path, needs] of doors) {
    it(`${method} ${path}`, async () => {
      as("COURTHOUSE_STAFF", []);
      expect(await call(method, path)).toBe(403); // no permissions: refused
      as("COURTHOUSE_STAFF", ["VIEW_CASES", "ASSIGN_CASES", "MANAGE_LAWYERS"].filter((p) => !needs.includes(p)));
      expect(await call(method, path)).toBe(403); // only OTHER permissions: refused
      as("COURTHOUSE_STAFF", [needs[0]!]);
      expect(letThrough(await call(method, path))).toBe(true); // the right one: let through
      as("SUPERADMIN");
      expect(letThrough(await call(method, path))).toBe(true); // courthouse admin: always
    });
  }

  it("the audit log, staff management and WhatsApp settings are courthouse-admin only, even for fully-delegated staff", async () => {
    const all = ["MANAGE_LAWYERS", "ASSIGN_CASES", "VIEW_CASES"];
    for (const [m, p] of [["GET", "/api/admin/audit-log"], ["GET", "/api/admin/staff"], ["POST", "/api/admin/staff"], ["POST", "/api/admin/staff/x/permissions"], ["POST", "/api/admin/staff/x/status"], ["POST", "/api/admin/staff/x/reset-password"], ["GET", "/api/admin/whatsapp/status"], ["PUT", "/api/admin/whatsapp/number"], ["POST", "/api/admin/whatsapp/connect"]] as const) {
      as("COURTHOUSE_STAFF", all);
      expect(await call(m, p), `${m} ${p} as staff`).toBe(403);
      as("SUPERADMIN");
      expect(letThrough(await call(m, p)), `${m} ${p} as admin`).toBe(true);
    }
  });

  it("lawyers, disputants and the platform owner cannot enter the courthouse admin area at all", async () => {
    for (const role of ["LAWYER", "DISPUTANT", "PLATFORM_ADMIN"]) {
      as(role, ["MANAGE_LAWYERS", "ASSIGN_CASES", "VIEW_CASES"]);
      expect(await call("GET", "/api/admin/lawyers"), role).toBe(403);
      expect(await call("GET", "/api/admin/whatsapp/status"), role).toBe(403);
    }
  });

  it("anonymous callers get 401", async () => {
    current = null;
    expect(await call("GET", "/api/admin/lawyers")).toBe(401);
    expect(await call("GET", "/api/platform/courthouses")).toBe(401);
  });
});

describe("platform owner area", () => {
  const routes: [string, string][] = [
    ["GET", "/api/platform/courthouses"],
    ["POST", "/api/platform/courthouses"],
    ["POST", "/api/platform/courthouses/x/admins"],
    ["POST", "/api/platform/admins/x/status"],
    ["POST", "/api/platform/admins/x/reset-password"],
    ["GET", "/api/platform/whatsapp/status"],
    ["PUT", "/api/platform/whatsapp/number"],
    ["POST", "/api/platform/whatsapp/connect"],
  ];
  it("is open to the platform owner and nobody else, courthouse admins included", async () => {
    for (const [m, p] of routes) {
      as("PLATFORM_ADMIN", [], null);
      expect(letThrough(await call(m, p)), `${m} ${p} as platform`).toBe(true);
      for (const role of ["SUPERADMIN", "COURTHOUSE_STAFF", "LAWYER", "DISPUTANT"]) {
        as(role, ["MANAGE_LAWYERS", "ASSIGN_CASES", "VIEW_CASES"]);
        expect(await call(m, p), `${m} ${p} as ${role}`).toBe(403);
      }
    }
  });
});
