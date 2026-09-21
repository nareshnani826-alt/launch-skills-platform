import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

// POST /api/admin/opportunities
// { clientName, status, revenueValue, requirements: [{ certificationName, countNeeded }] }
export async function POST(req: NextRequest) {
  if (!isAdmin(getSession())) {
    return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  }

  const body = await req.json();
  const clientName = String(body.clientName ?? "").trim();
  const status = String(body.status ?? "OPEN");
  const revenueValue = Number(body.revenueValue);
  const requirements: { certificationName: string; countNeeded: number }[] = Array.isArray(body.requirements)
    ? body.requirements
    : [];

  if (!clientName || !Number.isFinite(revenueValue)) {
    return NextResponse.json({ error: "clientName and revenueValue are required" }, { status: 400 });
  }
  if (!["OPEN", "STAFFED", "LOST", "WON"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      clientName,
      status,
      revenueValue,
      requirements: {
        create: requirements
          .filter((r) => r.certificationName && r.countNeeded > 0)
          .map((r) => ({ certificationName: r.certificationName, countNeeded: Number(r.countNeeded) })),
      },
    },
    include: { requirements: true },
  });

  return NextResponse.json(opportunity);
}
