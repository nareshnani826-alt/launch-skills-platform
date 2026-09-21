import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

// PATCH /api/admin/opportunities/:id  { clientName?, status?, revenueValue? }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(getSession())) {
    return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (body.clientName !== undefined) data.clientName = String(body.clientName).trim();
  if (body.status !== undefined) {
    if (!["OPEN", "STAFFED", "LOST", "WON"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = body.status;
  }
  if (body.revenueValue !== undefined) {
    const revenueValue = Number(body.revenueValue);
    if (!Number.isFinite(revenueValue)) {
      return NextResponse.json({ error: "revenueValue must be a number" }, { status: 400 });
    }
    data.revenueValue = revenueValue;
  }

  const opportunity = await prisma.opportunity.update({ where: { id: params.id }, data });
  return NextResponse.json(opportunity);
}
