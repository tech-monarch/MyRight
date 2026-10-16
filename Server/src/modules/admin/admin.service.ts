import { prisma } from "@/infrastructure/database/prisma";
import { hashPassword } from "@/utils/password";
import { generateTempPassword } from "@/utils/temp-password";
import { AppError } from "@/utils/AppError";
import { markMediatorAssignedIfReady } from "@/modules/disputes/disputes.service";
import { notifyAccountCreated, notifyLawyerAssigned } from "@/infrastructure/notifications/notification.service";
import type { StaffPermission } from "@/utils/permissions";
import type { UserStatus } from "@prisma/client";

export function listLawyers(courthouseId: string) {
  return prisma.user.findMany({
    where: { role: "LAWYER", courthouseId },
    orderBy: { createdAt: "desc" },
    include: { assignments: { select: { disputeId: true } } },
  });
}

export async function getLawyerInCourthouseOr404(id: string, courthouseId: string) {
  const lawyer = await prisma.user.findFirst({
    where: { id, role: "LAWYER", courthouseId },
    include: { assignments: { select: { disputeId: true } } },
  });
  if (!lawyer) throw AppError.notFound("Lawyer not found");
  return lawyer;
}

/**
 * Shared by lawyers, staff and courthouse admins: every account that logs in by
 * username needs a unique username AND a unique email, plus a phone so
 * WhatsApp notifications can reach them.
 */
export async function assertUsernameAndEmailFree(username: string, email: string) {
  if (await prisma.user.findUnique({ where: { username } })) throw AppError.conflict("That username is already taken.");
  if (await prisma.user.findUnique({ where: { email } })) throw AppError.conflict("That email is already in use.");
}

type NewAccount = { name: string; username: string; email: string; phone: string };

/** Creates a login-by-username account with a one-time temporary password the creator must hand over. */
export async function createStaffLoginAccount(
  role: "LAWYER" | "COURTHOUSE_STAFF" | "SUPERADMIN",
  courthouseId: string,
  input: NewAccount & { specialization?: string; permissions?: string[] },
  roleLabel: string
) {
  await assertUsernameAndEmailFree(input.username, input.email);

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);
  const user = await prisma.user.create({
    data: { role, courthouseId, passwordHash, mustChangePassword: true, ...input },
  });

  // Tell them an account exists and where to sign in. The password itself is NEVER sent:
  // it is returned once, to whoever created the account, and must be changed at first login.
  try {
    await notifyAccountCreated({
      userId: user.id,
      phone: user.phone,
      email: user.email,
      courthouseId,
      name: user.name,
      username: user.username!,
      roleLabel,
    });
  } catch (err) {
    console.error("Account-created notification failed", err instanceof Error ? err.name : "unknown");
  }

  // The plaintext password is returned exactly once, here, to the person who
  // just created the account. It is never stored, logged, or retrievable again.
  return { user, tempPassword };
}

export async function createLawyer(
  courthouseId: string,
  input: NewAccount & { specialization?: string }
) {
  const { user, tempPassword } = await createStaffLoginAccount("LAWYER", courthouseId, input, "lawyer");
  return { lawyer: user, tempPassword };
}

export function listStaff(courthouseId: string) {
  return prisma.user.findMany({ where: { role: "COURTHOUSE_STAFF", courthouseId }, orderBy: { createdAt: "desc" } });
}

export async function getStaffInCourthouseOr404(id: string, courthouseId: string) {
  const staff = await prisma.user.findFirst({ where: { id, role: "COURTHOUSE_STAFF", courthouseId } });
  if (!staff) throw AppError.notFound("Staff member not found");
  return staff;
}

export async function createStaff(
  courthouseId: string,
  input: NewAccount & { permissions: StaffPermission[] }
) {
  return createStaffLoginAccount("COURTHOUSE_STAFF", courthouseId, input, "staff");
}

export async function setStaffPermissions(id: string, courthouseId: string, permissions: StaffPermission[]) {
  await getStaffInCourthouseOr404(id, courthouseId);
  return prisma.user.update({ where: { id }, data: { permissions } });
}

export async function setStaffStatus(id: string, courthouseId: string, status: UserStatus) {
  await getStaffInCourthouseOr404(id, courthouseId);
  // Suspending also ends their active sessions so it takes effect immediately.
  const [user] = await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { status } }),
    ...(status !== "ACTIVE" ? [prisma.session.deleteMany({ where: { userId: id } })] : []),
  ]);
  return user;
}

export async function resetStaffPassword(id: string, courthouseId: string) {
  await getStaffInCourthouseOr404(id, courthouseId);
  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { passwordHash, mustChangePassword: true } }),
    prisma.session.deleteMany({ where: { userId: id } }),
  ]);
  return tempPassword;
}

export async function setLawyerStatus(id: string, courthouseId: string, status: UserStatus) {
  await getLawyerInCourthouseOr404(id, courthouseId);
  return prisma.user.update({ where: { id }, data: { status } });
}

export async function resetLawyerPassword(id: string, courthouseId: string) {
  await getLawyerInCourthouseOr404(id, courthouseId);
  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { passwordHash, mustChangePassword: true } }),
    prisma.session.deleteMany({ where: { userId: id } }),
  ]);
  return tempPassword;
}

export async function assignCase(lawyerId: string, courthouseId: string, disputeId: string, assignedById: string) {
  await getLawyerInCourthouseOr404(lawyerId, courthouseId);

  const dispute = await prisma.dispute.findUnique({ where: { id: disputeId, deletedAt: null } });
  if (!dispute) throw AppError.notFound("Dispute not found");

  // upsert: assigning a case that already has a different lawyer replaces
  // the assignment (see the schema comment on CaseAssignment for why this
  // is a single row rather than an append-only history table).
  const assignment = await prisma.caseAssignment.upsert({
    where: { disputeId },
    create: { disputeId, lawyerId, assignedById },
    update: { lawyerId, assignedById, assignedAt: new Date() },
  });

  // If mediation was already requested, the case is now "mediator assigned".
  await markMediatorAssignedIfReady(disputeId, dispute.status, assignedById, dispute.otherPartyResponse);

  // Tell the lawyer. Never allowed to fail the assignment itself.
  try {
    const lawyer = await prisma.user.findUnique({
      where: { id: lawyerId },
      select: { phone: true, email: true, courthouseId: true },
    });
    await notifyLawyerAssigned({
      lawyerId,
      phone: lawyer?.phone,
      email: lawyer?.email,
      courthouseId: lawyer?.courthouseId,
      disputeId,
      disputeTitle: dispute.title,
    });
  } catch (err) {
    console.error("Lawyer-assigned notification failed", err instanceof Error ? err.name : "unknown");
  }

  return assignment;
}

export async function removeAssignment(disputeId: string, courthouseId: string) {
  const assignment = await prisma.caseAssignment.findUnique({
    where: { disputeId },
    include: { lawyer: { select: { courthouseId: true } } },
  });
  if (!assignment || assignment.lawyer.courthouseId !== courthouseId) {
    throw AppError.notFound("Assignment not found");
  }
  await prisma.caseAssignment.delete({ where: { disputeId } });
}
