import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

// POST /api/admin/partner-programs  { name, tier, renewalDate? }
export async function POST(req: NextRequest) {
  if (!isAdmin(getSession())) {
    return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  }

  const body = await req.json();
  const name = String(body.name ?? "").trim();
  const tier = String(body.tier ?? "").trim();
  const renewalDate = body.renewalDate ? new Date(body.renewalDate) : null;

  if (!name || !tier) {
    return NextResponse.json({ error: "name and tier are required" }, { status: 400 });
  }

  const program = await prisma.partnerProgram.create({ data: { name, tier, renewalDate } });
  return NextResponse.json(program);
}
