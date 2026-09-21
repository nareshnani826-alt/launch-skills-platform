"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Opportunity = {
  id: string;
  clientName: string;
  status: string;
  revenueValue: number;
  requirements: { certificationName: string; countNeeded: number }[];
};

export default function OpportunitiesTable({ opportunities }: { opportunities: Opportunity[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ status: string; revenueValue: number }>({ status: "OPEN", revenueValue: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(o: Opportunity) {
    setEditingId(o.id);
    setDraft({ status: o.status, revenueValue: o.revenueValue });
    setError(null);
  }

  async function save(id: string) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/opportunities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to update opportunity");
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  return (
    <div className="card overflow-x-auto">
      <h3 className="mb-3 font-semibold">Existing opportunities</h3>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <table className="data w-full">
        <thead>
          <tr>
            <th>Client</th>
            <th>Status</th>
            <th>Revenue value</th>
            <th>Requirements</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((o) => {
            const editing = editingId === o.id;
            return (
              <tr key={o.id}>
                <td>{o.clientName}</td>
                <td>
                  {editing ? (
                    <select
                      className="rounded border border-neutral-300 px-2 py-1 text-xs"
                      value={draft.status}
                      onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="STAFFED">STAFFED</option>
                      <option value="WON">WON</option>
                      <option value="LOST">LOST</option>
                    </select>
                  ) : (
                    <span
                      className={`badge ${o.status === "WON" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}
                    >
                      {o.status}
                    </span>
                  )}
                </td>
                <td>
                  {editing ? (
                    <input
                      type="number"
                      className="w-28 rounded border border-neutral-300 px-2 py-1 text-xs"
                      value={draft.revenueValue}
                      onChange={(e) => setDraft({ ...draft, revenueValue: Number(e.target.value) })}
                    />
                  ) : (
                    `$${o.revenueValue.toLocaleString()}`
                  )}
                </td>
                <td>{o.requirements.map((r) => `${r.countNeeded}x ${r.certificationName}`).join(", ")}</td>
                <td>
                  {editing ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => save(o.id)}
                        disabled={busy}
                        className="rounded bg-accent px-2 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        disabled={busy}
                        className="rounded border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(o)}
                      className="rounded border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-50"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
