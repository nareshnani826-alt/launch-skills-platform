import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth";
import PipelineTable from "@/components/PipelineTable";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  requireAdminPage();
  const entries = await prisma.employeeCertification.findMany({
    include: { employee: true, certification: true },
    orderBy: [{ certification: { name: "asc" } }, { employee: { name: "asc" } }],
  });

  const rows = entries.map((ec) => ({
    id: ec.id,
    stage: ec.stage,
    targetDate: ec.targetDate ? ec.targetDate.toISOString() : null,
    employeeName: ec.employee.name,
    employeeRole: ec.employee.role,
    certName: ec.certification.name,
    certPartner: ec.certification.partner,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Certification Pipeline Tracking</h2>
        <p className="text-sm text-neutral-500">
          Leading indicators, not just completions. Click a stage tile to filter, search by name, or change a
          stage/target date below — writes through the API and persist.
        </p>
      </div>

      <PipelineTable rows={rows} />
    </div>
  );
}
