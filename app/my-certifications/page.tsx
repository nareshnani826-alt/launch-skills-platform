import { prisma } from "@/lib/prisma";
import { requireResourcePage } from "@/lib/auth";
import StageSelect from "@/components/StageSelect";

export const dynamic = "force-dynamic";

export default async function MyCertificationsPage() {
  const session = requireResourcePage();

  if (!session.employeeId) {
    return (
      <div className="card">
        <p className="text-sm text-neutral-500">
          Your account isn&apos;t linked to an employee record yet. Ask an admin to fix this in Manage Users.
        </p>
      </div>
    );
  }

  const entries = await prisma.employeeCertification.findMany({
    where: { employeeId: session.employeeId },
    include: { certification: true },
    orderBy: { certification: { name: "asc" } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">My Certifications</h2>
        <p className="text-sm text-neutral-500">Update the stage as you progress — it saves immediately.</p>
      </div>

      <div className="card overflow-x-auto">
        <table className="data w-full">
          <thead>
            <tr>
              <th>Certification</th>
              <th>Partner</th>
              <th>Stage</th>
              <th>Target date</th>
              <th>Certified date</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((ec) => (
              <tr key={ec.id}>
                <td>{ec.certification.name}</td>
                <td>{ec.certification.partner}</td>
                <td>
                  <StageSelect id={ec.id} stage={ec.stage} />
                </td>
                <td>{ec.targetDate ? new Date(ec.targetDate).toLocaleDateString() : "—"}</td>
                <td>{ec.certifiedDate ? new Date(ec.certifiedDate).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-neutral-400">
                  No certifications assigned yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
