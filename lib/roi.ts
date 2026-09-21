import { prisma } from "@/lib/prisma";

export function isQuarter(value: string) {
  return value === "all" || /^\d{4}-Q[1-4]$/.test(value);
}

export async function getRoiData(quarter: string) {
  const quarterFilter = quarter === "all" ? {} : { quarter };
  const [certifications, spendRows, attributions, allSpendRows, allAttributions, opportunities, quarters] = await Promise.all([
    prisma.certification.findMany({ orderBy: { name: "asc" } }),
    prisma.certificationSpend.findMany({
      where: quarterFilter,
      include: { certification: true },
      orderBy: [{ quarter: "desc" }, { certification: { name: "asc" } }],
    }),
    prisma.revenueAttribution.findMany({
      where: quarterFilter,
      include: { certification: true, opportunity: true },
      orderBy: [{ quarter: "desc" }, { revenueAmount: "desc" }],
    }),
    prisma.certificationSpend.findMany(),
    prisma.revenueAttribution.findMany(),
    prisma.opportunity.findMany({ orderBy: { clientName: "asc" } }),
    prisma.$queryRaw<Array<{ quarter: string }>>`
      SELECT DISTINCT quarter FROM "CertificationSpend"
      UNION
      SELECT DISTINCT quarter FROM "RevenueAttribution"
      ORDER BY quarter DESC
    `,
  ]);

  const spendByCertification = new Map<string, number>();
  for (const row of spendRows) {
    spendByCertification.set(row.certificationId, (spendByCertification.get(row.certificationId) ?? 0) + row.totalSpend);
  }
  const revenueByCertification = new Map<string, number>();
  for (const row of attributions) {
    revenueByCertification.set(row.certificationId, (revenueByCertification.get(row.certificationId) ?? 0) + row.revenueAmount);
  }

  const rows = certifications
    .map((certification) => {
      const totalSpend = spendByCertification.get(certification.id) ?? 0;
      const totalRevenue = revenueByCertification.get(certification.id) ?? 0;
      return {
        id: certification.id,
        name: certification.name,
        partner: certification.partner,
        totalSpend,
        totalRevenue,
        multiple: totalSpend > 0 ? totalRevenue / totalSpend : null,
      };
    })
    .filter((row) => row.totalSpend > 0 || row.totalRevenue > 0)
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  const totalSpend = spendRows.reduce((sum, row) => sum + row.totalSpend, 0);
  const totalRevenue = attributions.reduce((sum, row) => sum + row.revenueAmount, 0);
  const linkedRevenue = attributions
    .filter((row) => row.opportunityId)
    .reduce((sum, row) => sum + row.revenueAmount, 0);
  const capabilityRevenue = totalRevenue - linkedRevenue;
  const trendMap = new Map<string, { quarter: string; spend: number; revenue: number }>();
  for (const row of allSpendRows) {
    const trend = trendMap.get(row.quarter) ?? { quarter: row.quarter, spend: 0, revenue: 0 };
    trend.spend += row.totalSpend;
    trendMap.set(row.quarter, trend);
  }
  for (const row of allAttributions) {
    const trend = trendMap.get(row.quarter) ?? { quarter: row.quarter, spend: 0, revenue: 0 };
    trend.revenue += row.revenueAmount;
    trendMap.set(row.quarter, trend);
  }
  const trends = [...trendMap.values()]
    .sort((a, b) => b.quarter.localeCompare(a.quarter))
    .map((trend) => ({ ...trend, multiple: trend.spend > 0 ? trend.revenue / trend.spend : null }));

  return {
    rows,
    spendRows,
    attributions,
    opportunities,
    certifications,
    quarters: quarters.map((row) => row.quarter),
    trends,
    totals: {
      totalSpend,
      totalRevenue,
      linkedRevenue,
      capabilityRevenue,
      multiple: totalSpend > 0 ? totalRevenue / totalSpend : null,
    },
  };
}

export function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}