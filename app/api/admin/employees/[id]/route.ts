import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

// PATCH /api/admin/employees/:id  { name?, role?, location?, availabilityPct? }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(getSession())) {
    return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.role !== undefined) data.role = String(body.role).trim();
  if (body.location !== undefined) data.location = String(body.location).trim();
  if (body.availabilityPct !== undefined) {
    const pct = Number(body.availabilityPct);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      return NextResponse.json({ error: "availabilityPct must be between 0 and 100" }, { status: 400 });
    }
    data.availabilityPct = pct;
  }

  if ((data.name !== undefined && !data.name) || (data.role !== undefined && !data.role) || (data.location !== undefined && !data.location)) {
    return NextResponse.json({ error: "name, role, and location cannot be empty" }, { status: 400 });
  }

  const employee = await prisma.employee.update({ where: { id: params.id }, data });
  return NextResponse.json(employee);
}
