import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

// POST /api/admin/partner-requirements  { partnerProgramId, certificationId, minimumHeadcount }
export async function POST(req: NextRequest) {
  if (!isAdmin(getSession())) {
    return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  }

  const body = await req.json();
  const partnerProgramId = String(body.partnerProgramId ?? "");
  const certificationId = String(body.certificationId ?? "");
  const minimumHeadcount = Number(body.minimumHeadcount);

  if (!partnerProgramId || !certificationId || !Number.isFinite(minimumHeadcount) || minimumHeadcount < 1) {
    return NextResponse.json(
      { error: "partnerProgramId, certificationId, and a minimumHeadcount >= 1 are required" },
      { status: 400 }
    );
  }

  const requirement = await prisma.partnerRequirement.create({
    data: { partnerProgramId, certificationId, minimumHeadcount },
    include: { certification: true },
  });
  return NextResponse.json(requirement);
}
