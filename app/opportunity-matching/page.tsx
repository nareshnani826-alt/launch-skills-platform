import { prisma } from "@/lib/prisma";
import MatchForm from "@/components/MatchForm";

export const dynamic = "force-dynamic";

export default async function OpportunityMatchingPage() {
  const withReqs = await prisma.opportunity.findMany({
    orderBy: { createdAt: "desc" },
    include: { requirements: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Opportunity Matching</h2>
        <p className="text-sm text-neutral-500">
          When a sales opportunity is created, immediately see available, certified, in-progress resources — and
          the gap.
        </p>
      </div>

      <MatchForm />

      <div className="card overflow-x-auto">
        <h3 className="mb-3 font-semibold">Existing opportunities</h3>
        <table className="data w-full">
          <thead>
            <tr>
              <th>Client</th>
              <th>Status</th>
              <th>Revenue value</th>
              <th>Requirements</th>
            </tr>
          </thead>
          <tbody>
            {withReqs.map((o) => (
              <tr key={o.id}>
                <td>{o.clientName}</td>
                <td>
                  <span
                    className={`badge ${o.status === "WON" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}
                  >
                    {o.status}
                  </span>
                </td>
                <td>${o.revenueValue.toLocaleString()}</td>
                <td>{o.requirements.map((r: any) => `${r.countNeeded}x ${r.certificationName}`).join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
