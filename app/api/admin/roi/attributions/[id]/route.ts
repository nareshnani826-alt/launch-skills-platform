import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(getSession())) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.quarter !== undefined) {
    const quarter = String(body.quarter);
    if (!/^\d{4}-Q[1-4]$/.test(quarter)) return NextResponse.json({ error: "Invalid quarter" }, { status: 400 });
    data.quarter = quarter;
  }
  if (body.method !== undefined) data.method = String(body.method).trim();
  if (body.opportunityId !== undefined) data.opportunityId = body.opportunityId ? String(body.opportunityId) : null;
  if (body.revenueAmount !== undefined) {
    const revenueAmount = Number(body.revenueAmount);
    if (!Number.isFinite(revenueAmount) || revenueAmount < 0) return NextResponse.json({ error: "Invalid revenue" }, { status: 400 });
    data.revenueAmount = revenueAmount;
  }
  return NextResponse.json(await prisma.revenueAttribution.update({ where: { id: params.id }, data }));
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(getSession())) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  await prisma.revenueAttribution.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}