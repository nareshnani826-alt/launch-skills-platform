import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth";

const MAX_ATTEMPTS = 3;
const LOCKED_MESSAGE = "Account locked after too many failed attempts. Contact your admin to reset your password.";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const username = String(body.username ?? "");
  const password = String(body.password ?? "");

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  if (user.lockedAt) {
    return NextResponse.json({ error: LOCKED_MESSAGE }, { status: 423 });
  }

  if (!verifyPassword(password, user.passwordHash)) {
    const attempts = user.failedLoginAttempts + 1;

    if (attempts >= MAX_ATTEMPTS) {
      await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: attempts, lockedAt: new Date() } });
      return NextResponse.json({ error: LOCKED_MESSAGE }, { status: 423 });
    }

    await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: attempts } });
    const attemptsLeft = MAX_ATTEMPTS - attempts;
    return NextResponse.json(
      { error: `Invalid username or password. You have ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left.` },
      { status: 401 }
    );
  }

  if (user.failedLoginAttempts > 0) {
    await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedAt: null } });
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
