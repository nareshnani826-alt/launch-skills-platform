import { prisma } from "@/lib/prisma";
import MatchForm from "@/components/MatchForm";
import AddOpportunityForm from "@/components/AddOpportunityForm";
import OpportunitiesTable from "@/components/OpportunitiesTable";
import { requireAdminPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function OpportunityMatchingPage() {
  requireAdminPage();
  const [withReqs, certs] = await Promise.all([
    prisma.opportunity.findMany({
      orderBy: { createdAt: "desc" },
      include: { requirements: true },
    }),
    prisma.certification.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);

  const certOptions = certs.map((c) => c.name);

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
      <AddOpportunityForm certOptions={certOptions} />
      <OpportunitiesTable opportunities={withReqs} />
    </div>
  );
}
