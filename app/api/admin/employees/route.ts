import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

// POST /api/admin/employees  { name, role, location, availabilityPct? }
export async function POST(req: NextRequest) {
  if (!isAdmin(getSession())) {
    return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  }

  const body = await req.json();
  const name = String(body.name ?? "").trim();
  const role = String(body.role ?? "").trim();
  const location = String(body.location ?? "").trim();
  const availabilityPct = Number.isFinite(body.availabilityPct) ? Number(body.availabilityPct) : 100;

  if (!name || !role || !location) {
    return NextResponse.json({ error: "name, role, and location are required" }, { status: 400 });
  }
  if (availabilityPct < 0 || availabilityPct > 100) {
    return NextResponse.json({ error: "availabilityPct must be between 0 and 100" }, { status: 400 });
  }

  const employee = await prisma.employee.create({ data: { name, role, location, availabilityPct } });
  return NextResponse.json(employee);
}
