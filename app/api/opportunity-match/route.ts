import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/opportunity-match
// body: { requirements: [{ certificationName: string, countNeeded: number }] }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const requirements: { certificationName: string; countNeeded: number }[] = body.requirements ?? [];

  const results = await Promise.all(
    requirements.map(async (r) => {
      const cert = await prisma.certification.findUnique({ where: { name: r.certificationName } });
      if (!cert) {
        return { ...r, error: "Certification not found in catalog", available: [], busy: [], inProgress: [], gap: r.countNeeded };
      }

      const certifiedRows = await prisma.employeeCertification.findMany({
        where: { certificationId: cert.id, stage: "CERTIFIED" },
        include: { employee: true },
      });
      const inProgressRows = await prisma.employeeCertification.findMany({
        where: {
          certificationId: cert.id,
          stage: { in: ["PLANNED", "REGISTERED", "IN_LEARNING", "EXAM_SCHEDULED"] },
        },
        include: { employee: true },
      });

      const certifiedEmployees = certifiedRows.map((ec) => ({
        id: ec.employee.id,
        name: ec.employee.name,
        role: ec.employee.role,
        availabilityPct: ec.employee.availabilityPct,
      }));
      const inProgressEmployees = inProgressRows.map((ec) => ({
        id: ec.employee.id,
        name: ec.employee.name,
        stage: ec.stage,
      }));

      const available = certifiedEmployees.filter((e) => e.availabilityPct >= 30);
      const busy = certifiedEmployees.filter((e) => e.availabilityPct < 30);
      const gap = Math.max(0, r.countNeeded - available.length);

      return {
        certificationName: r.certificationName,
        countNeeded: r.countNeeded,
        available,
        busy,
        inProgress: inProgressEmployees,
        gap,
      };
    })
  );

  return NextResponse.json({ results });
}
