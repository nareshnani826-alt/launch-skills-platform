import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

// POST /api/admin/certifications  { name, partner, category, cost, validityMonths? }
export async function POST(req: NextRequest) {
  if (!isAdmin(getSession())) {
    return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  }

  const body = await req.json();
  const name = String(body.name ?? "").trim();
  const partner = String(body.partner ?? "").trim();
  const category = String(body.category ?? "").trim();
  const cost = Number(body.cost);
  const validityMonths = Number.isFinite(body.validityMonths) ? Number(body.validityMonths) : 24;

  if (!name || !partner || !category || !Number.isFinite(cost)) {
    return NextResponse.json({ error: "name, partner, category, and cost are required" }, { status: 400 });
  }

  const existing = await prisma.certification.findUnique({ where: { name } });
  if (existing) {
    return NextResponse.json({ error: "A certification with that name already exists" }, { status: 409 });
  }

  const certification = await prisma.certification.create({
    data: { name, partner, category, cost, validityMonths },
  });
  return NextResponse.json(certification);
}
