import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

const IN_PROGRESS_STAGES = ["PLANNED", "REGISTERED", "IN_LEARNING", "EXAM_SCHEDULED"] as const;

export default async function PartnerReadinessPage() {
  requireAdminPage();
  const [programs, stageCounts] = await Promise.all([
    prisma.partnerProgram.findMany({
      include: { requirements: { include: { certification: true } } },
    }),
    prisma.employeeCertification.groupBy({
      by: ["certificationId", "stage"],
      _count: { _all: true },
    }),
  ]);

  const countsByCert = new Map<string, { certifiedCount: number; inProgressCount: number }>();
  for (const row of stageCounts) {
    const entry = countsByCert.get(row.certificationId) ?? { certifiedCount: 0, inProgressCount: 0 };
    if (row.stage === "CERTIFIED") entry.certifiedCount += row._count._all;
    else if ((IN_PROGRESS_STAGES as readonly string[]).includes(row.stage)) entry.inProgressCount += row._count._all;
    countsByCert.set(row.certificationId, entry);
  }

  const data = programs.map((program) => {
    const reqRows = program.requirements.map((req) => {
      const counts = countsByCert.get(req.certificationId) ?? { certifiedCount: 0, inProgressCount: 0 };
      return {
        certification: req.certification.name,
        minimumHeadcount: req.minimumHeadcount,
        certifiedCount: counts.certifiedCount,
        inProgressCount: counts.inProgressCount,
        met: counts.certifiedCount >= req.minimumHeadcount,
      };
    });
    return { program, reqRows };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Partner Readiness Engine</h2>
        <p className="text-sm text-neutral-500">
          Readiness against each partner program&apos;s certification requirements. Requirement catalogs are
          seeded manually here — see the README on why partner-portal APIs mostly don&apos;t exist yet.
        </p>
      </div>

      {data.map(({ program, reqRows }) => {
        const metCount = reqRows.filter((r) => r.met).length;
        return (
          <div key={program.id} className="card">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  {program.name} <span className="text-sm font-normal text-neutral-500">— {program.tier}</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  Renewal: {program.renewalDate ? new Date(program.renewalDate).toLocaleDateString() : "—"}
                </p>
              </div>
              <span
                className={`badge ${
                  metCount === reqRows.length ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {metCount}/{reqRows.length} requirements met
              </span>
            </div>
            <table className="data w-full">
              <thead>
                <tr>
                  <th>Certification</th>
                  <th>Required headcount</th>
                  <th>Certified</th>
                  <th>In progress</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reqRows.map((r) => (
                  <tr key={r.certification}>
                    <td>{r.certification}</td>
                    <td>{r.minimumHeadcount}</td>
                    <td>{r.certifiedCount}</td>
                    <td>{r.inProgressCount}</td>
                    <td>
                      <span className={`badge ${r.met ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {r.met ? "Met" : `Gap of ${r.minimumHeadcount - r.certifiedCount}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
