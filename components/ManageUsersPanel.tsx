"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Row = {
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  userId: string | null;
  username: string | null;
};

function randomPassword(): string {
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 8);
}

export default function ManageUsersPanel({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, { username: string; password: string }>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function draftFor(employeeId: string, employeeName: string) {
    return (
      drafts[employeeId] ?? {
        username: employeeName.toLowerCase().replace(/[^a-z0-9]+/g, "."),
        password: randomPassword(),
      }
    );
  }

  function updateDraft(employeeId: string, patch: Partial<{ username: string; password: string }>) {
    setDrafts((prev) => ({ ...prev, [employeeId]: { ...draftFor(employeeId, ""), ...prev[employeeId], ...patch } }));
  }

  async function createLogin(row: Row) {
    const draft = draftFor(row.employeeId, row.employeeName);
    setBusyId(row.employeeId);
    setError(null);
    setNotice(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: row.employeeId, username: draft.username, password: draft.password }),
    });
    setBusyId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to create login");
      return;
    }
    setNotice(`Created login "${draft.username}" for ${row.employeeName} — password: ${draft.password}`);
    router.refresh();
  }

  async function resetPassword(row: Row) {
    if (!row.userId) return;
    const newPassword = randomPassword();
    setBusyId(row.employeeId);
    setError(null);
    setNotice(null);
    const res = await fetch(`/api/admin/users/${row.userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    setBusyId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to reset password");
      return;
    }
    setNotice(`New password for ${row.employeeName} (${row.username}): ${newPassword}`);
  }

  async function removeLogin(row: Row) {
    if (!row.userId) return;
    setBusyId(row.employeeId);
    setError(null);
    setNotice(null);
    const res = await fetch(`/api/admin/users/${row.userId}`, { method: "DELETE" });
    setBusyId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to remove login");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {notice && (
        <div className="card bg-emerald-50 text-sm text-emerald-800">
          {notice} <span className="text-emerald-600">(share this with them — it won&apos;t be shown again)</span>
        </div>
      )}
      {error && <div className="card bg-red-50 text-sm text-red-700">{error}</div>}

      <div className="card overflow-x-auto">
        <table className="data w-full">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Role</th>
              <th>Login</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const draft = draftFor(row.employeeId, row.employeeName);
              const busy = busyId === row.employeeId;
              return (
                <tr key={row.employeeId}>
                  <td>{row.employeeName}</td>
                  <td>{row.employeeRole}</td>
                  <td>
                    {row.username ? (
                      <span className="badge bg-blue-100 text-blue-700">{row.username}</span>
                    ) : (
                      <span className="text-neutral-400">No login</span>
                    )}
                  </td>
                  <td>
                    {row.username ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => resetPassword(row)}
                          disabled={busy}
                          className="rounded border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-50 disabled:opacity-50"
                        >
                          Reset password
                        </button>
                        <button
                          onClick={() => removeLogin(row)}
                          disabled={busy}
                          className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          className="w-32 rounded border border-neutral-300 px-2 py-1 text-xs"
                          value={draft.username}
                          onChange={(e) => updateDraft(row.employeeId, { username: e.target.value })}
                          placeholder="username"
                        />
                        <button
                          onClick={() => createLogin(row)}
                          disabled={busy}
                          className="rounded bg-accent px-2 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                        >
                          {busy ? "Creating..." : "Create login"}
                        </button>
                      </div>
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
