import { prisma } from "@/lib/prisma";
import StageSelect from "@/components/StageSelect";

export const dynamic = "force-dynamic";

const STAGES = ["PLANNED", "REGISTERED", "IN_LEARNING", "EXAM_SCHEDULED", "CERTIFIED", "RENEWAL_DUE"] as const;

export default async function PipelinePage() {
  const entries = await prisma.employeeCertification.findMany({
    include: { employee: true, certification: true },
    orderBy: [{ certification: { name: "asc" } }, { employee: { name: "asc" } }],
  });

  const rows = entries.map((ec) => ({
    id: ec.id,
    stage: ec.stage,
    targetDate: ec.targetDate,
    employeeName: ec.employee.name,
    employeeRole: ec.employee.role,
    certName: ec.certification.name,
    certPartner: ec.certification.partner,
  }));

  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.stage] = (counts[r.stage] ?? 0) + 1;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Certification Pipeline Tracking</h2>
        <p className="text-sm text-neutral-500">
          Leading indicators, not just completions. Change a stage below — it writes through the API and
          persists (working feature, not a mock).
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {STAGES.map((s) => (
          <div key={s} className="card text-center">
            <div className="text-2xl font-semibold">{counts[s] ?? 0}</div>
            <div className="text-xs text-neutral-500">{s.replace("_", " ")}</div>
          </div>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="data w-full">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Role</th>
              <th>Certification</th>
              <th>Partner</th>
              <th>Stage</th>
              <th>Target date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.employeeName}</td>
                <td>{r.employeeRole}</td>
                <td>{r.certName}</td>
                <td>{r.certPartner}</td>
                <td>
                  <StageSelect id={r.id} stage={r.stage} />
                </td>
                <td>{r.targetDate ? new Date(r.targetDate).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
