import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { authEmailForUsername, createSupabaseAdminClient } from "@/lib/supabase";

// POST /api/admin/users  { employeeId, username, password }
// Creates a RESOURCE login account linked to an employee.
export async function POST(req: NextRequest) {
  const session = getSession();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  }

  const body = await req.json();
  const employeeId = String(body.employeeId ?? "");
  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");

  if (!employeeId || !username || password.length < 8) {
    return NextResponse.json(
      { error: "employeeId and username are required; password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const employee = await prisma.employee.findUnique({ where: { id: employeeId }, include: { user: true } });
  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }
  if (employee.user) {
    return NextResponse.json({ error: "This employee already has a login" }, { status: 409 });
  }

  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) {
    return NextResponse.json({ error: "That username is already taken" }, { status: 409 });
  }

  const { data: authData, error: authError } = await createSupabaseAdminClient().auth.admin.createUser({
    email: authEmailForUsername(username),
    password,
    email_confirm: true,
  });
  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message ?? "Failed to create Supabase Auth user" }, { status: 400 });
  }

  const user = await prisma.user.create({
    data: { username, passwordHash: hashPassword(password), authUserId: authData.user.id, role: "RESOURCE", employeeId },
  });

  return NextResponse.json({ id: user.id, username: user.username, role: user.role, employeeId: user.employeeId });
}
