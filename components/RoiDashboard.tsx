"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Reveal from "@/components/Reveal";

type Certification = { id: string; name: string; partner: string };
type Opportunity = { id: string; clientName: string; status: string; revenueValue: number };
type Spend = { id: string; quarter: string; totalSpend: number; certification: Certification };
type Attribution = { id: string; quarter: string; method: string; revenueAmount: number; certification: Certification; opportunity: Opportunity | null };
type Row = { id: string; name: string; partner: string; totalSpend: number; totalRevenue: number; multiple: number | null };
type Props = { selectedQuarter: string; quarters: string[]; trends: Array<{ quarter: string; spend: number; revenue: number; multiple: number | null }>; rows: Row[]; spendRows: Spend[]; attributions: Attribution[]; opportunities: Opportunity[]; certifications: Certification[]; totals: { totalSpend: number; totalRevenue: number; linkedRevenue: number; capabilityRevenue: number; multiple: number | null } };

const money = (value: number) => `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const defaultQuarter = `${new Date().getFullYear()}-Q${Math.floor(new Date().getMonth() / 3) + 1}`;

export default function RoiDashboard(props: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [spend, setSpend] = useState({ certificationId: props.certifications[0]?.id ?? "", quarter: props.selectedQuarter === "all" ? defaultQuarter : props.selectedQuarter, totalSpend: "" });
  const [attribution, setAttribution] = useState({ certificationId: props.certifications[0]?.id ?? "", quarter: props.selectedQuarter === "all" ? defaultQuarter : props.selectedQuarter, opportunityId: "", method: "required-skill-on-won-deal", revenueAmount: "" });

  function selectQuarter(value: string) { router.push(value === "all" ? "/roi" : `/roi?quarter=${encodeURIComponent(value)}`); }
  async function submit(path: string, body: unknown) {
    setBusy(true); setError(null);
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    if (!response.ok) { const data = await response.json().catch(() => ({})); setError(data.error ?? "Could not save ROI data"); return; }
    router.refresh();
  }
  async function remove(path: string) {
    setBusy(true); setError(null);
    const response = await fetch(path, { method: "DELETE" });
    setBusy(false);
    if (!response.ok) { setError("Could not delete ROI row"); return; }
    router.refresh();
  }
  const maxRevenue = Math.max(...props.rows.map((row) => row.totalRevenue), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><h2 className="heading-fluid font-semibold">Certification ROI Dashboard</h2><p className="text-sm text-neutral-500">Track investment, opportunity influence, and capability unlocks by quarter.</p></div>
        <div className="flex flex-wrap gap-2"><label className="text-sm text-neutral-600">Quarter <select className="ml-1 rounded border border-neutral-300 bg-white px-2 py-1.5" value={props.selectedQuarter} onChange={(event) => selectQuarter(event.target.value)}><option value="all">All quarters</option>{props.quarters.map((quarter) => <option key={quarter} value={quarter}>{quarter}</option>)}</select></label><a className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white transition-opacity duration-300 ease-launch hover:opacity-90" href={`/api/admin/roi/export?quarter=${encodeURIComponent(props.selectedQuarter)}`}>Export CSV</a></div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{[[money(props.totals.totalSpend), "Training investment"], [money(props.totals.totalRevenue), "Revenue influenced"], [props.totals.multiple ? `${props.totals.multiple.toFixed(1)}x` : "—", "Blended ROI"], [money(props.totals.linkedRevenue), "Opportunity-linked"], [money(props.totals.capabilityRevenue), "Capability unlock"]].map(([value, label], index) => <Reveal key={label} delayMs={index * 60}><div className="card"><div className="text-2xl font-semibold">{value}</div><div className="text-xs text-neutral-500">{label}</div></div></Reveal>)}</div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="card space-y-4"><div><h3 className="font-semibold">Revenue by certification</h3><p className="text-xs text-neutral-500">Attributed revenue by selected quarter.</p></div><div className="space-y-3">{props.rows.map((row) => <div key={row.id}><div className="mb-1 flex justify-between gap-3 text-sm"><span className="truncate">{row.name}</span><span className="font-medium">{money(row.totalRevenue)}</span></div><div className="h-2 rounded bg-neutral-100"><div className="h-2 rounded bg-accent" style={{ width: `${Math.max((row.totalRevenue / maxRevenue) * 100, row.totalRevenue ? 3 : 0)}%` }} /></div><div className="mt-1 text-xs text-neutral-500">{row.multiple ? `${row.multiple.toFixed(1)}x return on ${money(row.totalSpend)} spend` : "No spend recorded"}</div></div>)}</div></section>
        <section className="card space-y-4"><div><h3 className="font-semibold">Revenue mix</h3><p className="text-xs text-neutral-500">Opportunity-linked versus capability attribution.</p></div>{([['Opportunity-linked', props.totals.linkedRevenue, '#c41874'], ['Capability unlock', props.totals.capabilityRevenue, '#6b2f85']] as Array<[string, number, string]>).map(([label, value, color]) => <div key={label}><div className="mb-1 flex justify-between text-sm"><span>{label}</span><strong>{props.totals.totalRevenue ? Math.round((value / props.totals.totalRevenue) * 100) : 0}%</strong></div><div className="h-3 rounded bg-neutral-100"><div className="h-3 rounded" style={{ width: `${props.totals.totalRevenue ? (value / props.totals.totalRevenue) * 100 : 0}%`, backgroundColor: color }} /></div></div>)}</section>
      </div>
      <section className="card overflow-x-auto"><div className="mb-3"><h3 className="font-semibold">Quarterly trend comparison</h3><p className="text-xs text-neutral-500">All-quarter context remains visible while the dashboard filter focuses the detail below.</p></div><table className="data w-full"><thead><tr><th>Quarter</th><th>Investment</th><th>Revenue influenced</th><th>ROI multiple</th></tr></thead><tbody>{props.trends.map((trend) => <tr key={trend.quarter} className={trend.quarter === props.selectedQuarter ? "bg-fuchsia-50" : ""}><td className="font-medium">{trend.quarter}</td><td>{money(trend.spend)}</td><td>{money(trend.revenue)}</td><td>{trend.multiple ? `${trend.multiple.toFixed(1)}x` : "—"}</td></tr>)}</tbody></table></section>
      <section className="card overflow-x-auto"><h3 className="mb-3 font-semibold">Opportunity-linked revenue</h3><table className="data w-full"><thead><tr><th>Quarter</th><th>Certification</th><th>Opportunity</th><th>Status</th><th>Method</th><th>Revenue</th><th /></tr></thead><tbody>{props.attributions.map((row) => <tr key={row.id}><td>{row.quarter}</td><td>{row.certification.name}</td><td>{row.opportunity?.clientName ?? "Capability unlock"}</td><td>{row.opportunity?.status ?? "—"}</td><td>{row.method}</td><td>{money(row.revenueAmount)}</td><td><button className="text-xs text-red-700 hover:underline" onClick={() => remove(`/api/admin/roi/attributions/${row.id}`)}>Delete</button></td></tr>)}</tbody></table></section>
      {error && <div className="card bg-red-50 text-sm text-red-700">{error}</div>}
      <div className="card bg-amber-50 text-sm text-amber-800"><strong>Methodology note:</strong> completed certifications automatically add catalog cost to investment. Revenue remains opportunity-linked and must use a finance-approved attribution.</div>
    </div>
  );
}