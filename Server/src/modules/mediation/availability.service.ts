import { prisma } from "@/infrastructure/database/prisma";

export function getAvailability(lawyerId: string) {
  return prisma.mediatorAvailability.findMany({
    where: { lawyerId },
    orderBy: [{ dayOfWeek: "asc" }, { startMinute: "asc" }],
  });
}

/**
 * Full replace rather than incremental add/remove endpoints: a weekly
 * schedule is small (a handful of slots) and edited as a whole in the
 * UI ("here is my week"), diffing individual slot changes would be more
 * code for no real benefit at this size.
 */
export async function setAvailability(
  lawyerId: string,
  slots: { dayOfWeek: number; startMinute: number; endMinute: number }[]
) {
  return prisma.$transaction([
    prisma.mediatorAvailability.deleteMany({ where: { lawyerId } }),
    prisma.mediatorAvailability.createMany({
      data: slots.map((s) => ({ lawyerId, ...s })),
    }),
  ]);
}
