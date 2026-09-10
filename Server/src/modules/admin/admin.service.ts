import { prisma } from "@/infrastructure/database/prisma";
import { hashPassword } from "@/utils/password";
import { generateTempPassword } from "@/utils/temp-password";
import { AppError } from "@/utils/AppError";
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

export async function createLawyer(
  courthouseId: string,
  input: { name: string; username: string; email?: string; phone?: string; specialization?: string }
) {
  const existing = await prisma.user.findUnique({ where: { username: input.username } });
  if (existing) throw AppError.conflict("That username is already taken.");

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  const lawyer = await prisma.user.create({
    data: {
      role: "LAWYER",
      courthouseId,
      passwordHash,
      mustChangePassword: true,
      ...input,
    },
  });

  // The plaintext password is returned exactly once, here, to the
  // SuperAdmin who just created the account. It is never stored, logged,
  // or retrievable again after this response.
  return { lawyer, tempPassword };
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
  return prisma.caseAssignment.upsert({
    where: { disputeId },
    create: { disputeId, lawyerId, assignedById },
    update: { lawyerId, assignedById, assignedAt: new Date() },
  });
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
