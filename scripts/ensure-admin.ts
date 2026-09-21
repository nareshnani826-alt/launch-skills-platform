import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";
import { authEmailForUsername, createSupabaseAdminClient } from "../lib/supabase";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const resetPassword = process.env.ADMIN_RESET_PASSWORD;

  if (!username) {
    throw new Error("ADMIN_USERNAME must be set");
  }

  const existingAdmin = await prisma.user.findUnique({ where: { username } });
  const supabase = createSupabaseAdminClient();
  const authEmail = authEmailForUsername(username);
  const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listError) throw listError;
  const authUser = authUsers.users.find((candidate) => candidate.email === authEmail);
  if (existingAdmin) {
    if (!authUser) {
      const initialPassword = resetPassword ?? password;
      if (!initialPassword) throw new Error("ADMIN_PASSWORD must be set to create the initial Supabase Auth admin");
      const { data, error } = await supabase.auth.admin.createUser({
        email: authEmail,
        password: initialPassword,
        email_confirm: true,
      });
      if (error || !data.user) throw error ?? new Error("Failed to create Supabase Auth admin");
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { authUserId: data.user.id, role: "ADMIN", failedLoginAttempts: 0, lockedAt: null },
      });
    } else {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          role: "ADMIN",
          authUserId: authUser.id,
          ...(resetPassword ? { failedLoginAttempts: 0, lockedAt: null } : {}),
        },
      });
      if (resetPassword) {
        const { error } = await supabase.auth.admin.updateUserById(authUser.id, { password: resetPassword });
        if (error) throw error;
      }
    }
  } else {
    const initialPassword = resetPassword ?? password;
    if (!initialPassword) {
      throw new Error("ADMIN_PASSWORD must be set when creating the first admin");
    }
    const { data, error } = await supabase.auth.admin.createUser({ email: authEmail, password: initialPassword, email_confirm: true });
    if (error || !data.user) throw error ?? new Error("Failed to create Supabase Auth admin");
    await prisma.user.create({ data: { username, passwordHash: hashPassword(initialPassword), authUserId: data.user.id, role: "ADMIN" } });
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