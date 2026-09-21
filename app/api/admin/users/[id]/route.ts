import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { createSupabaseAdminClient, upsertSupabaseAuthPassword } from "@/lib/supabase";

// PATCH /api/admin/users/:id  { password }  -- reset a resource account's password
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  }

  const body = await req.json();
  const password = String(body.password ?? "");
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target || target.role !== "RESOURCE") {
    return NextResponse.json({ error: "Resource account not found" }, { status: 404 });
  }

  // Accounts created before the Supabase Auth migration have no authUserId;
  // this links (or creates) the auth user so the account can log in.
  const result = await upsertSupabaseAuthPassword(target.username, password, target.authUserId);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  await prisma.user.update({
    where: { id: params.id },
    data: { passwordHash: hashPassword(password), authUserId: result.authUserId, failedLoginAttempts: 0, lockedAt: null },
  });
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/users/:id  -- remove a resource account's login
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target || target.role !== "RESOURCE") {
    return NextResponse.json({ error: "Resource account not found" }, { status: 404 });
  }

  if (target.authUserId) {
    const { error: authError } = await createSupabaseAdminClient().auth.admin.deleteUser(target.authUserId);
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });
  }
  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
