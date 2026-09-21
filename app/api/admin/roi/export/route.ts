import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { csvCell, isQuarter } from "@/lib/roi";

export async function GET(req: NextRequest) {
  if (!isAdmin(getSession())) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const quarter = req.nextUrl.searchParams.get("quarter") ?? "all";
  if (!isQuarter(quarter)) return NextResponse.json({ error: "Invalid quarter" }, { status: 400 });
  const rows = await prisma.revenueAttribution.findMany({
    where: quarter === "all" ? {} : { quarter },
    include: { certification: true, opportunity: true },
    orderBy: [{ quarter: "desc" }, { revenueAmount: "desc" }],
  });
  const lines = ["Quarter,Certification,Partner,Method,Opportunity,Opportunity status,Opportunity value,Attributed revenue"];
  for (const row of rows) {
    lines.push([
      row.quarter,
      row.certification.name,
      row.certification.partner,
      row.method,
      row.opportunity?.clientName ?? "",
      row.opportunity?.status ?? "",
      row.opportunity?.revenueValue ?? "",
      row.revenueAmount,
    ].map(csvCell).join(","));
  }
  return new NextResponse(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="roi-${quarter}.csv"`,
    },
  });
}