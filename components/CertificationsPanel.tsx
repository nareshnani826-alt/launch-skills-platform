"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Cert = {
  id: string;
  name: string;
  partner: string;
  category: string;
  cost: number;
  validityMonths: number;
};

type Draft = { name: string; partner: string; category: string; cost: number; validityMonths: number };

const emptyDraft: Draft = { name: "", partner: "", category: "", cost: 0, validityMonths: 24 };

export default function CertificationsPanel({ certs }: { certs: Cert[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft);
  const [newDraft, setNewDraft] = useState<Draft>(emptyDraft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(c: Cert) {
    setEditingId(c.id);
    setEditDraft({ name: c.name, partner: c.partner, category: c.category, cost: c.cost, validityMonths: c.validityMonths });
    setError(null);
  }

  async function saveEdit(id: string) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/certifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editDraft),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to update certification");
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  async function addCert(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/certifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDraft),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to add certification");
      return;
    }
    setNewDraft(emptyDraft);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <h3 className="font-semibold">Add a certification</h3>
        <form onSubmit={addCert} className="grid grid-cols-1 gap-2 sm:grid-cols-6 sm:items-end">
          <input
            required
            placeholder="Name"
            className="rounded border border-neutral-300 px-2 py-1.5 text-sm sm:col-span-2"
            value={newDraft.name}
            onChange={(e) => setNewDraft({ ...newDraft, name: e.target.value })}
          />
          <input
            required
            placeholder="Partner"
            className="rounded border border-neutral-300 px-2 py-1.5 text-sm"
            value={newDraft.partner}
            onChange={(e) => setNewDraft({ ...newDraft, partner: e.target.value })}
          />
          <input
            required
            placeholder="Category"
            className="rounded border border-neutral-300 px-2 py-1.5 text-sm"
            value={newDraft.category}
            onChange={(e) => setNewDraft({ ...newDraft, category: e.target.value })}
          />
          <input
            type="number"
            placeholder="Cost"
            className="rounded border border-neutral-300 px-2 py-1.5 text-sm"
            value={newDraft.cost}
            onChange={(e) => setNewDraft({ ...newDraft, cost: Number(e.target.value) })}
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            Add
          </button>
        </form>
      </div>

      {error && <div className="card bg-red-50 text-sm text-red-700">{error}</div>}

      <div className="card overflow-x-auto">
        <table className="data w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Partner</th>
              <th>Category</th>
              <th>Cost</th>
              <th>Validity (months)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {certs.map((c) => {
              const editing = editingId === c.id;
              return (
                <tr key={c.id}>
                  {editing ? (
                    <>
                      <td>
                        <input
                          className="w-32 rounded border border-neutral-300 px-2 py-1 text-xs"
                          value={editDraft.name}
                          onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          className="w-24 rounded border border-neutral-300 px-2 py-1 text-xs"
                          value={editDraft.partner}
                          onChange={(e) => setEditDraft({ ...editDraft, partner: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          className="w-28 rounded border border-neutral-300 px-2 py-1 text-xs"
                          value={editDraft.category}
                          onChange={(e) => setEditDraft({ ...editDraft, category: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="w-20 rounded border border-neutral-300 px-2 py-1 text-xs"
                          value={editDraft.cost}
                          onChange={(e) => setEditDraft({ ...editDraft, cost: Number(e.target.value) })}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="w-16 rounded border border-neutral-300 px-2 py-1 text-xs"
                          value={editDraft.validityMonths}
                          onChange={(e) => setEditDraft({ ...editDraft, validityMonths: Number(e.target.value) })}
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{c.name}</td>
                      <td>{c.partner}</td>
                      <td>{c.category}</td>
                      <td>${c.cost.toLocaleString()}</td>
                      <td>{c.validityMonths}</td>
                    </>
                  )}
                  <td>
                    {editing ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(c.id)}
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
                        onClick={() => startEdit(c)}
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
    </div>
  );
}
