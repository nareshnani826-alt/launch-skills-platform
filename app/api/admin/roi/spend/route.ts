import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

function validQuarter(value: string) {
  return /^\d{4}-Q[1-4]$/.test(value);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(getSession())) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const body = await req.json();
  const certificationId = String(body.certificationId ?? "");
  const quarter = String(body.quarter ?? "");
  const totalSpend = Number(body.totalSpend);
  if (!certificationId || !validQuarter(quarter) || !Number.isFinite(totalSpend) || totalSpend < 0) {
    return NextResponse.json({ error: "certificationId, valid quarter, and non-negative totalSpend are required" }, { status: 400 });
  }
  const certification = await prisma.certification.findUnique({ where: { id: certificationId } });
  if (!certification) return NextResponse.json({ error: "Certification not found" }, { status: 404 });
  const spend = await prisma.certificationSpend.create({ data: { certificationId, quarter, totalSpend } });
  return NextResponse.json(spend);
}