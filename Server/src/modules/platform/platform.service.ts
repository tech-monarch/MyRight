import { prisma } from "@/infrastructure/database/prisma";
import { hashPassword } from "@/utils/password";
import { generateTempPassword } from "@/utils/temp-password";
import { AppError } from "@/utils/AppError";
import { assertUsernameAndEmailFree, createStaffLoginAccount } from "@/modules/admin/admin.service";
import type { UserStatus } from "@prisma/client";

type AdminInput = { name: string; username: string; email: string; phone: string };

/** Every courthouse with headcounts, its admins, and its WhatsApp number (never the saved credentials). */
export async function listCourthouses() {
  const [courthouses, counts, admins, sessions] = await Promise.all([
    prisma.courthouse.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.groupBy({ by: ["courthouseId", "role"], where: { courthouseId: { not: null } }, _count: { _all: true } }),
    prisma.user.findMany({
      where: { role: "SUPERADMIN", courthouseId: { not: null } },
      select: { id: true, name: true, username: true, email: true, phone: true, status: true, courthouseId: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.whatsAppSession.findMany({ select: { scopeKey: true, phoneNumber: true, creds: true } }),
  ]);

  return courthouses.map((c) => {
    const n = (role: string) => counts.find((x) => x.courthouseId === c.id && x.role === role)?._count._all ?? 0;
    const wa = sessions.find((s) => s.scopeKey === c.id);
    return {
      id: c.id,
      name: c.name,
      createdAt: c.createdAt,
      counts: { admins: n("SUPERADMIN"), staff: n("COURTHOUSE_STAFF"), lawyers: n("LAWYER") },
      admins: admins.filter((a) => a.courthouseId === c.id),
      whatsapp: { number: wa?.phoneNumber ?? null, linked: Boolean(wa?.creds) },
    };
  });
}

/** Creates a courthouse together with its first admin, who gets a one-time temporary password. */
export async function createCourthouse(input: { name: string; admin: AdminInput }) {
  // Checked up front so a taken username doesn't leave an admin-less courthouse behind.
  await assertUsernameAndEmailFree(input.admin.username, input.admin.email);
  const courthouse = await prisma.courthouse.create({ data: { name: input.name } });
  const { user, tempPassword } = await createStaffLoginAccount("SUPERADMIN", courthouse.id, input.admin, "courthouse admin");
  return { courthouse, admin: user, tempPassword };
}

export async function addCourthouseAdmin(courthouseId: string, admin: AdminInput) {
  const courthouse = await prisma.courthouse.findUnique({ where: { id: courthouseId } });
  if (!courthouse) throw AppError.notFound("Courthouse not found");
  return createStaffLoginAccount("SUPERADMIN", courthouseId, admin, "courthouse admin");
}

async function getCourthouseAdminOr404(id: string) {
  const admin = await prisma.user.findFirst({ where: { id, role: "SUPERADMIN" } });
  if (!admin) throw AppError.notFound("Courthouse admin not found");
  return admin;
}

export async function setAdminStatus(id: string, status: UserStatus) {
  await getCourthouseAdminOr404(id);
  const [user] = await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { status } }),
    ...(status !== "ACTIVE" ? [prisma.session.deleteMany({ where: { userId: id } })] : []),
  ]);
  return user;
}

export async function resetAdminPassword(id: string) {
  await getCourthouseAdminOr404(id);
  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { passwordHash, mustChangePassword: true } }),
    prisma.session.deleteMany({ where: { userId: id } }),
  ]);
  return tempPassword;
}
