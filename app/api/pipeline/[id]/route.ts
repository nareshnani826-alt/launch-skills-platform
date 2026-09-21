import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PipelineStage } from "@prisma/client";

const STAGES = ["PLANNED", "REGISTERED", "IN_LEARNING", "EXAM_SCHEDULED", "CERTIFIED", "RENEWAL_DUE"];

// PATCH /api/pipeline/:id  { stage: "CERTIFIED" }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const stage = body.stage as string;

  if (!STAGES.includes(stage)) {
    return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
  }

  const existing = await prisma.employeeCertification.findUnique({
    where: { id: params.id },
    include: { certification: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isNowCertified = stage === "CERTIFIED" && existing.stage !== "CERTIFIED";
  const certifiedDate = isNowCertified ? new Date() : existing.certifiedDate;
  const expiresOn =
    isNowCertified && certifiedDate
      ? new Date(certifiedDate.getTime() + existing.certification.validityMonths * 30 * 24 * 60 * 60 * 1000)
      : existing.expiresOn;

  const updated = await prisma.employeeCertification.update({
    where: { id: params.id },
    data: { stage: stage as PipelineStage, certifiedDate, expiresOn },
  });

  return NextResponse.json(updated);
}
