/**
 * Creates the platform owner account (the company's super admin). Run once,
 * locally, against the production database:
 *
 *   npm run platform-admin:create -- --name "Your Name" --username yourname --email you@company.com --phone 07012345678
 *
 * Prints a one-time temporary password. You must change it at first login.
 * Refuses to run if the username or email already exists. Never touches any
 * other data.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/password";
import { generateTempPassword } from "../src/utils/temp-password";
import { isPlausiblePhone } from "../src/utils/phone";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1]?.trim() : undefined;
}

async function main() {
  const name = arg("name");
  const username = arg("username")?.toLowerCase();
  const email = arg("email")?.toLowerCase();
  const phone = arg("phone");

  if (!name || !username || !email || !phone) {
    console.error('Usage: npm run platform-admin:create -- --name "Name" --username handle --email a@b.com --phone 07012345678');
    process.exit(1);
  }
  if (!/^[a-z0-9._-]{3,}$/.test(username)) throw new Error("Username: lowercase letters, numbers, . _ - only (min 3).");
  if (!email.includes("@")) throw new Error("That email doesn't look valid.");
  if (!isPlausiblePhone(phone)) throw new Error("That phone number doesn't look valid.");

  const prisma = new PrismaClient();
  try {
    if (await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } })) {
      throw new Error("That username or email is already in use. Nothing was changed.");
    }
    const tempPassword = generateTempPassword();
    await prisma.user.create({
      data: {
        role: "PLATFORM_ADMIN",
        name,
        username,
        email,
        phone,
        passwordHash: await hashPassword(tempPassword),
        mustChangePassword: true,
      },
    });
    console.log("\nPlatform admin created.");
    console.log(`  Sign in with:      ${username}  (or ${email})`);
    console.log(`  Temporary password: ${tempPassword}`);
    console.log("  You will be asked to change it at first login. This is the only time it is shown.\n");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
