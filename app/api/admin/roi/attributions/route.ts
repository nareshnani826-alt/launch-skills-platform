import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { getSession, isAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!isAdmin(getSession())) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const body = await req.json();
  const certificationId = String(body.certificationId ?? "");
  const quarter = String(body.quarter ?? "");
  const method = String(body.method ?? "").trim();
  const revenueAmount = Number(body.revenueAmount);
  const opportunityId = body.opportunityId ? String(body.opportunityId) : null;
  if (!certificationId || !/^\d{4}-Q[1-4]$/.test(quarter) || !method || !Number.isFinite(revenueAmount) || revenueAmount < 0) {
    return NextResponse.json({ error: "certificationId, quarter, method, and non-negative revenueAmount are required" }, { status: 400 });
  }
  const certification = await prisma.certification.findUnique({ where: { id: certificationId } });
  if (!certification) return NextResponse.json({ error: "Certification not found" }, { status: 404 });
  if (opportunityId && !(await prisma.opportunity.findUnique({ where: { id: opportunityId } }))) {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }
  return NextResponse.json(await prisma.revenueAttribution.create({ data: { certificationId, opportunityId, quarter, method, revenueAmount } }));
}