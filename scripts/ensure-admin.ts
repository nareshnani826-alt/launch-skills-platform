import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const resetPassword = process.env.ADMIN_RESET_PASSWORD;

  if (!username) {
    throw new Error("ADMIN_USERNAME must be set");
  }

  const existingAdmin = await prisma.user.findUnique({ where: { username } });
  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        role: "ADMIN",
        ...(resetPassword
          ? { passwordHash: hashPassword(resetPassword), failedLoginAttempts: 0, lockedAt: null }
          : {}),
      },
    });
  } else {
    const initialPassword = resetPassword ?? password;
    if (!initialPassword) {
      throw new Error("ADMIN_PASSWORD must be set when creating the first admin");
    }
    await prisma.user.create({ data: { username, passwordHash: hashPassword(initialPassword), role: "ADMIN" } });
  }

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