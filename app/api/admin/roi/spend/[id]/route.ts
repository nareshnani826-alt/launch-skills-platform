import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(getSession())) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const body = await req.json();
  const data: { quarter?: string; totalSpend?: number } = {};
  if (body.quarter !== undefined) {
    const quarter = String(body.quarter);
    if (!/^\d{4}-Q[1-4]$/.test(quarter)) return NextResponse.json({ error: "Invalid quarter" }, { status: 400 });
    data.quarter = quarter;
  }
  if (body.totalSpend !== undefined) {
    const totalSpend = Number(body.totalSpend);
    if (!Number.isFinite(totalSpend) || totalSpend < 0) return NextResponse.json({ error: "Invalid spend" }, { status: 400 });
    data.totalSpend = totalSpend;
  }
  return NextResponse.json(await prisma.certificationSpend.update({ where: { id: params.id }, data }));
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(getSession())) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  await prisma.certificationSpend.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}