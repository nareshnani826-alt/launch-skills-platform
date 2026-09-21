"use client";

import { useState } from "react";

const CERT_OPTIONS = [
  "AZ-204",
  "AZ-400",
  "AI-102",
  "Fabric Analytics Engineer",
  "Power Platform Solution Architect",
  "Databricks Data Engineer Associate",
  "Databricks Machine Learning Associate",
  "Databricks Generative AI Associate",
  "Claude Certified Developer",
  "Agentic Development Certification",
  "MCP Practitioner",
];

export default function PodForm() {
  const [clientNeed, setClientNeed] = useState("Agentic support automation for a retail client");
  const [techStack, setTechStack] = useState<string[]>(["Claude Certified Developer", "Databricks Data Engineer Associate"]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  function toggleCert(c: string) {
    setTechStack((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/pod-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientNeed, techStack }),
    });
    setResult(await res.json());
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <div>
          <label className="text-xs font-semibold text-neutral-500">Client need</label>
          <input
            className="mt-1 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
            value={clientNeed}
            onChange={(e) => setClientNeed(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-neutral-500">Technology stack (select certifications)</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {CERT_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => toggleCert(c)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  techStack.includes(c)
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={submit}
          disabled={loading || techStack.length === 0}
          className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Building pod..." : "Recommend pod"}
        </button>
      </div>

      {result && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Recommended pod for: {result.clientNeed}</h3>
            <span className="badge bg-accent/10 text-accent">
              Est. ${result.estimatedCost.toLocaleString()} · {(result.estimatedMargin * 100).toFixed(0)}% margin
            </span>
          </div>

          <div>
            <div className="text-xs font-semibold text-neutral-500">Pod Lead</div>
            <div className="text-sm">
              {result.recommendedLead
                ? `${result.recommendedLead.name} — ${result.recommendedLead.role} (${result.recommendedLead.availabilityPct}% available)`
                : "No single person covers multiple requested skills — split leadership needed"}
            </div>
          </div>

          <table className="data w-full">
            <thead>
              <tr>
                <th>Requested certification</th>
                <th>Top candidates</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {result.perSkill.map((s: any) => (
                <tr key={s.certification}>
                  <td>{s.certification}</td>
                  <td>
                    {s.candidates.length
                      ? s.candidates.map((c: any) => `${c.name} (${c.availabilityPct}%)`).join(", ")
                      : "—"}
                  </td>
                  <td>
                    <span className={`badge ${s.gap ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {s.gap ? "Certification gap" : "Covered"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-neutral-500">
            Cost and margin are placeholder blended figures — a real version pulls the client rate card and each
            employee&apos;s loaded cost. Flagged in the Gap Analysis.
          </p>
        </div>
      )}
    </div>
  );
}
