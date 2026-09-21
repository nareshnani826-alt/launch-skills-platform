"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Requirement = { certificationName: string; countNeeded: number };

export default function AddOpportunityForm({ certOptions }: { certOptions: string[] }) {
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [revenueValue, setRevenueValue] = useState(0);
  const [reqs, setReqs] = useState<Requirement[]>([{ certificationName: certOptions[0] ?? "", countNeeded: 1 }]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateReq(i: number, patch: Partial<Requirement>) {
    setReqs((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientName, status, revenueValue, requirements: reqs }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to add opportunity");
      return;
    }
    setClientName("");
    setStatus("OPEN");
    setRevenueValue(0);
    setReqs([{ certificationName: certOptions[0] ?? "", countNeeded: 1 }]);
    router.refresh();
  }

  return (
    <div className="card space-y-3">
      <h3 className="font-semibold">Add an opportunity</h3>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input
            required
            placeholder="Client name"
            className="rounded border border-neutral-300 px-2 py-1.5 text-sm"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
          <select
            className="rounded border border-neutral-300 px-2 py-1.5 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="OPEN">OPEN</option>
            <option value="STAFFED">STAFFED</option>
            <option value="WON">WON</option>
            <option value="LOST">LOST</option>
          </select>
          <input
            type="number"
            placeholder="Revenue value"
            className="rounded border border-neutral-300 px-2 py-1.5 text-sm"
            value={revenueValue}
            onChange={(e) => setRevenueValue(Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          {reqs.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                className="rounded border border-neutral-300 px-2 py-1 text-sm"
                value={r.certificationName}
                onChange={(e) => updateReq(i, { certificationName: e.target.value })}
              >
                {certOptions.map((c) => (
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
            type="button"
            onClick={() => setReqs((prev) => [...prev, { certificationName: certOptions[0] ?? "", countNeeded: 1 }])}
            className="rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            + Add requirement
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Adding..." : "Add opportunity"}
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}
