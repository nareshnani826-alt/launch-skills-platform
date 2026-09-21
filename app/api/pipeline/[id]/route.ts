import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Prisma, PipelineStage } from "@prisma/client";

const STAGES = ["PLANNED", "REGISTERED", "IN_LEARNING", "EXAM_SCHEDULED", "CERTIFIED", "RENEWAL_DUE"];

// PATCH /api/pipeline/:id  { stage?: "CERTIFIED", targetDate?: "2026-11-30" | null }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const body = await req.json();

  const existing = await prisma.employeeCertification.findUnique({
    where: { id: params.id },
    include: { certification: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (session.role !== "ADMIN" && existing.employeeId !== session.employeeId) {
    return NextResponse.json({ error: "You can only update your own certifications" }, { status: 403 });
  }

  const data: Prisma.EmployeeCertificationUpdateInput = {};

  if (body.stage !== undefined) {
    const stage = body.stage as string;
    if (!STAGES.includes(stage)) {
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }
    data.stage = stage as PipelineStage;

    const isNowCertified = stage === "CERTIFIED" && existing.stage !== "CERTIFIED";
    if (isNowCertified) {
      const certifiedDate = new Date();
      data.certifiedDate = certifiedDate;
      data.expiresOn = new Date(
        certifiedDate.getTime() + existing.certification.validityMonths * 30 * 24 * 60 * 60 * 1000
      );
    }
  }

  if (body.targetDate !== undefined) {
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can set the target date" }, { status: 403 });
    }
    data.targetDate = body.targetDate ? new Date(body.targetDate) : null;
  }

  const updated = await prisma.employeeCertification.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(updated);
}
