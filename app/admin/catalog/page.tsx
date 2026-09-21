import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth";
import CertificationsPanel from "@/components/CertificationsPanel";
import PartnerProgramsPanel from "@/components/PartnerProgramsPanel";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  requireAdminPage();

  const [certs, programs] = await Promise.all([
    prisma.certification.findMany({ orderBy: { name: "asc" } }),
    prisma.partnerProgram.findMany({
      include: { requirements: { include: { certification: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const programRows = programs.map((p) => ({
    id: p.id,
    name: p.name,
    tier: p.tier,
    requirements: p.requirements.map((r) => ({
      id: r.id,
      certificationId: r.certificationId,
      certName: r.certification.name,
      minimumHeadcount: r.minimumHeadcount,
    })),
  }));

  const certOptions = certs.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Certifications & Partner Requirements</h2>
        <p className="text-sm text-neutral-500">
          Manage the certification catalog and each partner program&apos;s headcount requirements.
        </p>
      </div>

      <CertificationsPanel certs={certs} />

      <div>
        <h3 className="mb-3 text-lg font-semibold">Partner Programs</h3>
        <PartnerProgramsPanel programs={programRows} certOptions={certOptions} />
      </div>
    </div>
  );
}
