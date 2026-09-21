import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PartnerReadinessPage() {
  const programs = await prisma.partnerProgram.findMany({
    include: { requirements: { include: { certification: true } } },
  });

  const data = await Promise.all(
    programs.map(async (program) => {
      const reqRows = await Promise.all(
        program.requirements.map(async (req) => {
          const certifiedCount = await prisma.employeeCertification.count({
            where: { certificationId: req.certificationId, stage: "CERTIFIED" },
          });
          const inProgressCount = await prisma.employeeCertification.count({
            where: {
              certificationId: req.certificationId,
              stage: { in: ["PLANNED", "REGISTERED", "IN_LEARNING", "EXAM_SCHEDULED"] },
            },
          });
          return {
            certification: req.certification.name,
            minimumHeadcount: req.minimumHeadcount,
            certifiedCount,
            inProgressCount,
            met: certifiedCount >= req.minimumHeadcount,
          };
        })
      );
      return { program, reqRows };
    })
  );

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
