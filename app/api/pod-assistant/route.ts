import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

// How far along a not-yet-certified employee is; higher = closer to certified.
const STAGE_PROGRESS: Record<string, number> = { PLANNED: 1, REGISTERED: 2, IN_LEARNING: 3, EXAM_SCHEDULED: 4 };

// POST /api/pod-assistant
// body: { clientNeed: string, techStack: string[] }  (techStack = certification names)
export async function POST(req: NextRequest) {
  if (!isAdmin(getSession())) {
    return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  }

  const body = await req.json();
  const techStack: string[] = body.techStack ?? [];
  const clientNeed: string = body.clientNeed ?? "";

  const candidatesByCert = await Promise.all(
    techStack.map(async (certName) => {
      const cert = await prisma.certification.findUnique({
        where: { name: certName },
        include: {
          employeeCertifications: {
            include: { employee: true },
            orderBy: { employee: { availabilityPct: "desc" } },
          },
        },
      });
      if (!cert) return { certName, certCost: 0, candidates: [] as any[], closest: [] as any[] };

      const candidates = cert.employeeCertifications
        .filter((ec) => ec.stage === "CERTIFIED")
        .map((ec) => ({
          id: ec.employee.id,
          name: ec.employee.name,
          role: ec.employee.role,
          availabilityPct: ec.employee.availabilityPct,
        }));

      // people already on the path to this certification, nearest to finishing first
      const closest = cert.employeeCertifications
        .filter((ec) => ec.stage in STAGE_PROGRESS)
        .sort(
          (a, b) =>
            STAGE_PROGRESS[b.stage] - STAGE_PROGRESS[a.stage] ||
            (a.targetDate?.getTime() ?? Infinity) - (b.targetDate?.getTime() ?? Infinity)
        )
        .slice(0, 3)
        .map((ec) => ({
          name: ec.employee.name,
          availabilityPct: ec.employee.availabilityPct,
          stage: ec.stage,
          targetDate: ec.targetDate,
        }));

      return { certName, certCost: cert.cost, candidates, closest };
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

  const gaps = candidatesByCert.filter((c) => c.candidates.length === 0);

  return NextResponse.json({
    clientNeed,
    techStack,
    recommendedLead: lead,
    perSkill: candidatesByCert.map((c) => ({
      certification: c.certName,
      candidates: c.candidates.slice(0, 3),
      closest: c.closest,
      gap: c.candidates.length === 0,
    })),
    // real catalog cost of certifying one person in each uncovered skill
    gapClosingCost: gaps.reduce((sum, c) => sum + c.certCost, 0),
    estimatedCost,
    estimatedMargin,
  });
}
