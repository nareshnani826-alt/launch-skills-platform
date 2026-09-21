import { requireAdminPage } from "@/lib/auth";
import { getRoiData } from "@/lib/roi";
import RoiDashboard from "@/components/RoiDashboard";

export const dynamic = "force-dynamic";

export default async function RoiPage({ searchParams }: { searchParams: { quarter?: string } }) {
  requireAdminPage();
  const quarter = searchParams.quarter ?? "all";
  const data = await getRoiData(/^[0-9]{4}-Q[1-4]$/.test(quarter) || quarter === "all" ? quarter : "all");
  return <RoiDashboard {...data} selectedQuarter={quarter} />;
}
