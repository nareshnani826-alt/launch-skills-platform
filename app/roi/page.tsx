import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RoiPage() {
  requireAdminPage();
  const certs = await prisma.certification.findMany({
    include: { spend: true, revenueAttributions: true },
  });

  const rows = certs
    .map((c) => {
      const totalSpend = c.spend.reduce((s, x) => s + x.totalSpend, 0);
      const totalRevenue = c.revenueAttributions.reduce((s, x) => s + x.revenueAmount, 0);
      const multiple = totalSpend > 0 ? totalRevenue / totalSpend : null;
      return { name: c.name, partner: c.partner, totalSpend, totalRevenue, multiple };
    })
    .filter((r) => r.totalSpend > 0 || r.totalRevenue > 0)
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  const grandSpend = rows.reduce((s, r) => s + r.totalSpend, 0);
  const grandRevenue = rows.reduce((s, r) => s + r.totalRevenue, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Certification ROI Dashboard</h2>
        <p className="text-sm text-neutral-500">
          Moves the conversation from &quot;how many certifications&quot; to &quot;how much business capability
          did certifications create.&quot;
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="card text-center">
          <div className="text-2xl font-semibold">${grandSpend.toLocaleString()}</div>
          <div className="text-xs text-neutral-500">Total cert spend (2026-Q3)</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold">${grandRevenue.toLocaleString()}</div>
          <div className="text-xs text-neutral-500">Revenue influenced</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold">{grandSpend > 0 ? (grandRevenue / grandSpend).toFixed(1) : "—"}x</div>
          <div className="text-xs text-neutral-500">Blended ROI multiple</div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="data w-full">
          <thead>
            <tr>
              <th>Certification</th>
              <th>Partner</th>
              <th>Cost</th>
              <th>Revenue influenced</th>
              <th>ROI multiple</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td>{r.partner}</td>
                <td>${r.totalSpend.toLocaleString()}</td>
                <td>${r.totalRevenue.toLocaleString()}</td>
                <td>{r.multiple ? `${r.multiple.toFixed(1)}x` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card bg-amber-50 text-sm text-amber-800">
        <strong>Methodology note (MVP placeholder):</strong> revenue attribution here uses three seeded example
        methods — <code>required-skill-on-won-deal</code>, <code>required-skill-on-open-deal-pro-rated</code>, and{" "}
        <code>practice-capability-unlock</code>. A real deployment needs finance and delivery leadership to agree
        on one defensible methodology before these numbers go in front of leadership — see the Gap Analysis in
        the assessment doc.
      </div>
    </div>
  );
}
