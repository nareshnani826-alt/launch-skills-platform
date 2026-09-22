import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth";
import { authEmailForUsername, createSupabaseAuthClient } from "@/lib/supabase";

const LOCKED_MESSAGE = "Account locked after too many failed attempts. Contact your admin to reset your password.";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const username = String(body.username ?? "");
  const password = String(body.password ?? "");

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    console.warn(`[login] rejected: no user with username "${username}"`);
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  if (user.lockedAt) {
    return NextResponse.json({ error: LOCKED_MESSAGE }, { status: 423 });
  }

  const { error } = await createSupabaseAuthClient().auth.signInWithPassword({
    email: authEmailForUsername(username),
    password,
  });
  if (error) {
    console.warn(`[login] rejected by Supabase for ${authEmailForUsername(username)}: ${error.message}`);
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set(
    SESSION_COOKIE_NAME,
    createSessionToken({ uid: user.id, username: user.username, role: user.role, employeeId: user.employeeId }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    }
  );
  return res;
}
