import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username) {
    throw new Error("ADMIN_USERNAME must be set");
  }

  const existingAdmin = await prisma.user.findUnique({ where: { username } });
  if (existingAdmin) {
    await prisma.user.update({ where: { id: existingAdmin.id }, data: { role: "ADMIN" } });
  } else {
    if (!password) {
      throw new Error("ADMIN_PASSWORD must be set when creating the first admin");
    }
    await prisma.user.create({ data: { username, passwordHash: hashPassword(password), role: "ADMIN" } });
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