"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Requirement = { id: string; certificationId: string; certName: string; minimumHeadcount: number };
type Program = { id: string; name: string; tier: string; requirements: Requirement[] };
type CertOption = { id: string; name: string };

export default function PartnerProgramsPanel({ programs, certOptions }: { programs: Program[]; certOptions: CertOption[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newProgram, setNewProgram] = useState({ name: "", tier: "" });
  const [newReq, setNewReq] = useState<Record<string, { certificationId: string; minimumHeadcount: number }>>({});
  const [editingReqId, setEditingReqId] = useState<string | null>(null);
  const [editHeadcount, setEditHeadcount] = useState(1);

  function reqDraftFor(programId: string) {
    return newReq[programId] ?? { certificationId: certOptions[0]?.id ?? "", minimumHeadcount: 1 };
  }

  async function addProgram(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/partner-programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProgram),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to add partner program");
      return;
    }
    setNewProgram({ name: "", tier: "" });
    router.refresh();
  }

  async function addRequirement(programId: string) {
    const draft = reqDraftFor(programId);
    if (!draft.certificationId) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/partner-requirements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partnerProgramId: programId, ...draft }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to add requirement");
      return;
    }
    setNewReq((prev) => ({ ...prev, [programId]: { certificationId: certOptions[0]?.id ?? "", minimumHeadcount: 1 } }));
    router.refresh();
  }

  async function saveHeadcount(reqId: string) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/partner-requirements/${reqId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minimumHeadcount: editHeadcount }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to update requirement");
      return;
    }
    setEditingReqId(null);
    router.refresh();
  }

  async function removeRequirement(reqId: string) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/partner-requirements/${reqId}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to remove requirement");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <h3 className="font-semibold">Add a partner program</h3>
        <form onSubmit={addProgram} className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-end">
          <input
            required
            placeholder="Name (e.g. Microsoft)"
            className="rounded border border-neutral-300 px-2 py-1.5 text-sm sm:col-span-2"
            value={newProgram.name}
            onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
          />
          <input
            required
            placeholder="Tier"
            className="rounded border border-neutral-300 px-2 py-1.5 text-sm"
            value={newProgram.tier}
            onChange={(e) => setNewProgram({ ...newProgram, tier: e.target.value })}
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            Add program
          </button>
        </form>
      </div>

      {error && <div className="card bg-red-50 text-sm text-red-700">{error}</div>}

      {programs.map((program) => {
        const draft = reqDraftFor(program.id);
        return (
          <div key={program.id} className="card space-y-3">
            <h3 className="font-semibold">
              {program.name} <span className="text-sm font-normal text-neutral-500">— {program.tier}</span>
            </h3>
            <table className="data w-full">
              <thead>
                <tr>
                  <th>Certification</th>
                  <th>Minimum headcount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {program.requirements.map((r) => (
                  <tr key={r.id}>
                    <td>{r.certName}</td>
                    <td>
                      {editingReqId === r.id ? (
                        <input
                          type="number"
                          min={1}
                          className="w-16 rounded border border-neutral-300 px-2 py-1 text-xs"
                          value={editHeadcount}
                          onChange={(e) => setEditHeadcount(Number(e.target.value))}
                        />
                      ) : (
                        r.minimumHeadcount
                      )}
                    </td>
                    <td>
                      {editingReqId === r.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveHeadcount(r.id)}
                            disabled={busy}
                            className="rounded bg-accent px-2 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingReqId(null)}
                            disabled={busy}
                            className="rounded border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-50 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingReqId(r.id);
                              setEditHeadcount(r.minimumHeadcount);
                            }}
                            className="rounded border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => removeRequirement(r.id)}
                            disabled={busy}
                            className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center gap-2">
              <select
                className="rounded border border-neutral-300 px-2 py-1.5 text-sm"
                value={draft.certificationId}
                onChange={(e) =>
                  setNewReq((prev) => ({ ...prev, [program.id]: { ...draft, certificationId: e.target.value } }))
                }
              >
                {certOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                className="w-20 rounded border border-neutral-300 px-2 py-1.5 text-sm"
                value={draft.minimumHeadcount}
                onChange={(e) =>
                  setNewReq((prev) => ({ ...prev, [program.id]: { ...draft, minimumHeadcount: Number(e.target.value) } }))
                }
              />
              <button
                onClick={() => addRequirement(program.id)}
                disabled={busy}
                className="rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-50"
              >
                Add requirement
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
