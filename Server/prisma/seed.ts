import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

async function main() {
  const courthouse = await prisma.courthouse.upsert({
    where: { id: "seed-courthouse-1" },
    update: {},
    create: { id: "seed-courthouse-1", name: "Lagos Central ADR Courthouse" },
  });

  const superAdminPassword = await hashPassword("ChangeMe123!");
  await prisma.user.upsert({
    where: { username: "superadmin" },
    update: {},
    create: {
      role: "SUPERADMIN",
      name: "Courthouse Admin",
      username: "superadmin",
      passwordHash: superAdminPassword,
      courthouseId: courthouse.id,
    },
  });

  const lawyerPassword = await hashPassword("ChangeMe123!");
  await prisma.user.upsert({
    where: { username: "chinelo.adeyemi" },
    update: {},
    create: {
      role: "LAWYER",
      name: "Chinelo Adeyemi",
      username: "chinelo.adeyemi",
      passwordHash: lawyerPassword,
      courthouseId: courthouse.id,
      specialization: "Tenancy & property disputes",
      mustChangePassword: true,
    },
  });

  const disputantPassword = await hashPassword("ChangeMe123!");
  const disputant = await prisma.user.upsert({
    where: { email: "adaeze@example.com" },
    update: {},
    create: {
      role: "DISPUTANT",
      name: "Adaeze Okafor",
      email: "adaeze@example.com",
      passwordHash: disputantPassword,
    },
  });

  await prisma.dispute.upsert({
    where: { id: "seed-dispute-1" },
    update: {},
    create: {
      id: "seed-dispute-1",
      ownerId: disputant.id,
      title: "Deposit not refunded, Yaba apartment",
      description:
        "Landlord has withheld the full security deposit for three weeks after move out, citing vague cleaning costs with no receipts provided.",
      type: "Tenancy",
      otherPartyName: "Mr. Bassey Eyo (landlord)",
      desiredOutcome: "Full refund of the deposit within 14 days",
      status: "UNDER_REVIEW",
    },
  });

  console.log("Seed complete.");
  console.log("SuperAdmin login: username=superadmin password=ChangeMe123!");
  console.log("Lawyer login:     username=chinelo.adeyemi password=ChangeMe123! (must change on first login)");
  console.log("Disputant login:  email=adaeze@example.com password=ChangeMe123!");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
