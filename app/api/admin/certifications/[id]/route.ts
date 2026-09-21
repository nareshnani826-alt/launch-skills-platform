import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

// PATCH /api/admin/certifications/:id  { name?, partner?, category?, cost?, validityMonths? }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(getSession())) {
    return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.partner !== undefined) data.partner = String(body.partner).trim();
  if (body.category !== undefined) data.category = String(body.category).trim();
  if (body.cost !== undefined) {
    const cost = Number(body.cost);
    if (!Number.isFinite(cost)) return NextResponse.json({ error: "cost must be a number" }, { status: 400 });
    data.cost = cost;
  }
  if (body.validityMonths !== undefined) {
    const validityMonths = Number(body.validityMonths);
    if (!Number.isFinite(validityMonths)) {
      return NextResponse.json({ error: "validityMonths must be a number" }, { status: 400 });
    }
    data.validityMonths = validityMonths;
  }

  const certification = await prisma.certification.update({ where: { id: params.id }, data });
  return NextResponse.json(certification);
}
