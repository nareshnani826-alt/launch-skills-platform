import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be set");
  }

  await prisma.user.upsert({
    where: { username },
    update: { passwordHash: hashPassword(password), role: "ADMIN", failedLoginAttempts: 0, lockedAt: null },
    create: { username, passwordHash: hashPassword(password), role: "ADMIN" },
  });

  console.log(`Admin login ready: ${username}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });