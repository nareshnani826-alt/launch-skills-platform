import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

// PATCH /api/admin/partner-requirements/:id  { minimumHeadcount }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(getSession())) {
    return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  }

  const body = await req.json();
  const minimumHeadcount = Number(body.minimumHeadcount);
  if (!Number.isFinite(minimumHeadcount) || minimumHeadcount < 1) {
    return NextResponse.json({ error: "minimumHeadcount must be a number >= 1" }, { status: 400 });
  }

  const requirement = await prisma.partnerRequirement.update({
    where: { id: params.id },
    data: { minimumHeadcount },
  });
  return NextResponse.json(requirement);
}

// DELETE /api/admin/partner-requirements/:id
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(getSession())) {
    return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  }

  await prisma.partnerRequirement.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
