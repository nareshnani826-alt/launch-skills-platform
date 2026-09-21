import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/pod-assistant
// body: { clientNeed: string, techStack: string[] }  (techStack = certification names)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const techStack: string[] = body.techStack ?? [];
  const clientNeed: string = body.clientNeed ?? "";

  const candidatesByCert = await Promise.all(
    techStack.map(async (certName) => {
      const cert = await prisma.certification.findUnique({
        where: { name: certName },
        include: {
          employeeCertifications: {
            where: { stage: "CERTIFIED" },
            include: { employee: true },
            orderBy: { employee: { availabilityPct: "desc" } },
          },
        },
      });
      if (!cert) return { certName, candidates: [] as any[] };

      const candidates = cert.employeeCertifications.map((ec) => ({
        id: ec.employee.id,
        name: ec.employee.name,
        role: ec.employee.role,
        availabilityPct: ec.employee.availabilityPct,
      }));

      return { certName, candidates };
    })
  );

  const scoreMap = new Map<string, { employee: any; coverage: number }>();
  for (const { candidates } of candidatesByCert) {
    for (const emp of candidates) {
      const entry = scoreMap.get(emp.id) ?? { employee: emp, coverage: 0 };
      entry.coverage += 1;
      scoreMap.set(emp.id, entry);
    }
  }
  const ranked = [...scoreMap.values()].sort(
    (a, b) => b.coverage - a.coverage || b.employee.availabilityPct - a.employee.availabilityPct
  );

  const lead = ranked[0]?.employee ?? null;
  const estimatedCost = techStack.length * 3500;
  const estimatedMargin = 0.32;

  return NextResponse.json({
    clientNeed,
    techStack,
    recommendedLead: lead,
    perSkill: candidatesByCert.map((c) => ({
      certification: c.certName,
      candidates: c.candidates.slice(0, 3),
      gap: c.candidates.length === 0,
    })),
    estimatedCost,
    estimatedMargin,
  });
}
