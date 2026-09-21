"use client";

import { useState } from "react";

type Requirement = { certificationName: string; countNeeded: number };
type MatchResult = {
  certificationName: string;
  countNeeded: number;
  available: { id: string; name: string; role: string; availabilityPct: number }[];
  busy: { id: string; name: string }[];
  inProgress: { id: string; name: string; stage: string }[];
  gap: number;
  error?: string;
};

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

export default function MatchForm() {
  const [reqs, setReqs] = useState<Requirement[]>([{ certificationName: CERT_OPTIONS[0], countNeeded: 1 }]);
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  function updateReq(i: number, patch: Partial<Requirement>) {
    setReqs((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  async function runMatch() {
    setLoading(true);
    const res = await fetch("/api/opportunity-match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requirements: reqs }),
    });
    const data = await res.json();
    setResults(data.results);
    setLoading(false);
  }

  return (
    <div className="card space-y-4">
      <h3 className="font-semibold">Check a new opportunity&apos;s staffing need</h3>
      <p className="text-sm text-neutral-500">
        e.g. &quot;Need: 2 Claude-certified engineers, 1 Databricks engineer, 1 Azure Architect&quot;
      </p>

      <div className="space-y-2">
        {reqs.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <select
              className="rounded border border-neutral-300 px-2 py-1 text-sm"
              value={r.certificationName}
              onChange={(e) => updateReq(i, { certificationName: e.target.value })}
            >
              {CERT_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={r.countNeeded}
              onChange={(e) => updateReq(i, { countNeeded: Number(e.target.value) })}
              className="w-16 rounded border border-neutral-300 px-2 py-1 text-sm"
            />
            <span className="text-sm text-neutral-500">needed</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setReqs((prev) => [...prev, { certificationName: CERT_OPTIONS[0], countNeeded: 1 }])}
          className="rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
        >
          + Add requirement
        </button>
        <button
          onClick={runMatch}
          disabled={loading}
          className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Matching..." : "Find matches"}
        </button>
      </div>

      {results && (
        <div className="space-y-3 border-t border-neutral-200 pt-4">
          {results.map((r) => (
            <div key={r.certificationName} className="rounded-lg bg-neutral-50 p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">
                  {r.certificationName} — need {r.countNeeded}
                </span>
                <span
                  className={`badge ${r.gap === 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                >
                  {r.gap === 0 ? "Fully staffable" : `Gap of ${r.gap}`}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                <div>
                  <div className="text-xs font-semibold text-neutral-500">Available &amp; certified</div>
                  {r.available.length ? r.available.map((e) => <div key={e.id}>{e.name} ({e.availabilityPct}% free)</div>) : <div className="text-neutral-400">None</div>}
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-500">Certified but busy</div>
                  {r.busy.length ? r.busy.map((e) => <div key={e.id}>{e.name}</div>) : <div className="text-neutral-400">None</div>}
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-500">In progress</div>
                  {r.inProgress.length ? r.inProgress.map((e) => <div key={e.id}>{e.name} ({e.stage.replace("_", " ")})</div>) : <div className="text-neutral-400">None</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
