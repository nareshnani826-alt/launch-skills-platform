import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type Session = {
  uid: string;
  username: string;
  role: "ADMIN" | "RESOURCE";
  employeeId: string | null;
};

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createSessionToken(user: Session): string {
  const payload = Buffer.from(JSON.stringify({ ...user, exp: Date.now() + SESSION_TTL_MS })).toString(
    "base64url"
  );
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function verifySessionToken(token: string): Session | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (typeof data.exp !== "number" || data.exp <= Date.now()) return null;
    return { uid: data.uid, username: data.username, role: data.role, employeeId: data.employeeId ?? null };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;

// Server components and route handlers can both read cookies() from next/headers.
export function getSession(): Session | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function isAdmin(session: Session | null): session is Session {
  return session?.role === "ADMIN";
}

// Call at the top of an admin-only page's server component.
export function requireAdminPage(): Session {
  const session = getSession();
  if (!session) redirect("/login");
  if (!isAdmin(session)) redirect("/my-certifications");
  return session;
}

// Call at the top of the resource-only page's server component.
export function requireResourcePage(): Session {
  const session = getSession();
  if (!session) redirect("/login");
  if (isAdmin(session)) redirect("/pipeline");
  return session;
}
