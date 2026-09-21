"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";

type Row = {
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  employeeLocation: string;
  employeeAvailabilityPct: number;
  userId: string | null;
  username: string | null;
  locked: boolean;
};

function randomPassword(): string {
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 8);
}

export default function ManageUsersPanel({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, { username: string; password: string }>>({});
  const [resetDrafts, setResetDrafts] = useState<Record<string, string>>({});
  const [openLoginId, setOpenLoginId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ name: string; role: string; location: string; availabilityPct: number } | null>(
    null
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Password fields start empty (not a silent random guess) so what's shown is always
  // exactly what will be submitted — admin types their own or clicks Generate.
  function draftFor(employeeId: string, employeeName: string) {
    return drafts[employeeId] ?? { username: employeeName.toLowerCase().replace(/[^a-z0-9]+/g, "."), password: "" };
  }

  function updateDraft(employeeId: string, patch: Partial<{ username: string; password: string }>) {
    setDrafts((prev) => ({ ...prev, [employeeId]: { ...draftFor(employeeId, ""), ...prev[employeeId], ...patch } }));
  }

  function resetDraftFor(employeeId: string) {
    return resetDrafts[employeeId] ?? "";
  }

  function toggleLoginPanel(employeeId: string) {
    setOpenLoginId((prev) => (prev === employeeId ? null : employeeId));
    setError(null);
    setNotice(null);
  }

  function startEdit(row: Row) {
    setEditingId(row.employeeId);
    setEditDraft({
      name: row.employeeName,
      role: row.employeeRole,
      location: row.employeeLocation,
      availabilityPct: row.employeeAvailabilityPct,
    });
    setError(null);
    setNotice(null);
  }

  async function saveEdit(row: Row) {
    if (!editDraft) return;
    setBusyId(row.employeeId);
    setError(null);
    const res = await fetch(`/api/admin/employees/${row.employeeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editDraft),
    });
    setBusyId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to update employee");
      return;
    }
    setEditingId(null);
    setEditDraft(null);
    router.refresh();
  }

  async function createLogin(row: Row) {
    const draft = draftFor(row.employeeId, row.employeeName);
    if (draft.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
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
    setOpenLoginId(null);
    router.refresh();
  }

  async function resetPassword(row: Row) {
    if (!row.userId) return;
    const newPassword = resetDraftFor(row.employeeId);
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
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
    setNotice(`Password updated for ${row.employeeName} (${row.username}) — password: ${newPassword}`);
    setOpenLoginId(null);
    router.refresh();
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
    setOpenLoginId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {notice && <div className="card bg-emerald-50 text-sm text-emerald-800">{notice}</div>}
      {error && <div className="card bg-red-50 text-sm text-red-700">{error}</div>}

      <div className="card overflow-x-auto">
        <table className="data w-full">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Role</th>
              <th>Location</th>
              <th>Availability %</th>
              <th>Login</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const draft = draftFor(row.employeeId, row.employeeName);
              const busy = busyId === row.employeeId;
              const editing = editingId === row.employeeId && editDraft;
              const loginPanelOpen = openLoginId === row.employeeId;

              return (
                <Fragment key={row.employeeId}>
                  <tr>
                    {editing ? (
                      <>
                        <td>
                          <input
                            className="w-28 rounded border border-neutral-300 px-2 py-1 text-xs"
                            value={editDraft!.name}
                            onChange={(e) => setEditDraft({ ...editDraft!, name: e.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            className="w-24 rounded border border-neutral-300 px-2 py-1 text-xs"
                            value={editDraft!.role}
                            onChange={(e) => setEditDraft({ ...editDraft!, role: e.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            className="w-24 rounded border border-neutral-300 px-2 py-1 text-xs"
                            value={editDraft!.location}
                            onChange={(e) => setEditDraft({ ...editDraft!, location: e.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            className="w-16 rounded border border-neutral-300 px-2 py-1 text-xs"
                            value={editDraft!.availabilityPct}
                            onChange={(e) => setEditDraft({ ...editDraft!, availabilityPct: Number(e.target.value) })}
                          />
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{row.employeeName}</td>
                        <td>{row.employeeRole}</td>
                        <td>{row.employeeLocation}</td>
                        <td>{row.employeeAvailabilityPct}%</td>
                      </>
                    )}
                    <td>
                      {row.username ? (
                        <span className="flex items-center gap-1">
                          <span className="badge bg-blue-100 text-blue-700">{row.username}</span>
                          {row.locked && <span className="badge bg-red-100 text-red-700">Locked</span>}
                        </span>
                      ) : (
                        <span className="text-neutral-400">No login</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {editing ? (
                          <>
                            <button
                              onClick={() => saveEdit(row)}
                              disabled={busy}
                              className="rounded bg-accent px-2 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                            >
                              {busy ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditDraft(null);
                              }}
                              disabled={busy}
                              className="rounded border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-50 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => startEdit(row)}
                            className="w-16 rounded border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-50"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => toggleLoginPanel(row.employeeId)}
                          className={`w-28 rounded border px-2 py-1 text-xs ${
                            loginPanelOpen
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-neutral-300 hover:bg-neutral-50"
                          }`}
                        >
                          {row.username ? "Manage login" : "Create login"}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {loginPanelOpen && (
                    <tr className="bg-neutral-50">
                      <td colSpan={6}>
                        {row.username ? (
                          <div className="flex flex-wrap items-end gap-2 py-1">
                            <div>
                              <label className="block text-xs font-semibold text-neutral-500">New password</label>
                              <input
                                className="mt-1 w-40 rounded border border-neutral-300 px-2 py-1 text-xs"
                                value={resetDraftFor(row.employeeId)}
                                onChange={(e) => setResetDrafts((prev) => ({ ...prev, [row.employeeId]: e.target.value }))}
                                placeholder="new password"
                              />
                            </div>
                            <button
                              onClick={() => setResetDrafts((prev) => ({ ...prev, [row.employeeId]: randomPassword() }))}
                              className="rounded border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-50"
                            >
                              Generate
                            </button>
                            <button
                              onClick={() => resetPassword(row)}
                              disabled={busy || resetDraftFor(row.employeeId).length < 8}
                              className="rounded bg-accent px-2 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                            >
                              Set password
                            </button>
                            <button
                              onClick={() => removeLogin(row)}
                              disabled={busy}
                              className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              Remove login
                            </button>
                            <button
                              onClick={() => setOpenLoginId(null)}
                              className="text-xs text-neutral-500 underline hover:text-neutral-800"
                            >
                              Close
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-end gap-2 py-1">
                            <div>
                              <label className="block text-xs font-semibold text-neutral-500">Username</label>
                              <input
                                className="mt-1 w-36 rounded border border-neutral-300 px-2 py-1 text-xs"
                                value={draft.username}
                                onChange={(e) => updateDraft(row.employeeId, { username: e.target.value })}
                                placeholder="username"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-neutral-500">Password</label>
                              <input
                                className="mt-1 w-40 rounded border border-neutral-300 px-2 py-1 text-xs"
                                value={draft.password}
                                onChange={(e) => updateDraft(row.employeeId, { password: e.target.value })}
                                placeholder="password"
                              />
                            </div>
                            <button
                              onClick={() => updateDraft(row.employeeId, { password: randomPassword() })}
                              className="rounded border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-50"
                            >
                              Generate
                            </button>
                            <button
                              onClick={() => createLogin(row)}
                              disabled={busy || draft.password.length < 8}
                              className="rounded bg-accent px-2 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                            >
                              {busy ? "Creating..." : "Create login"}
                            </button>
                            <button
                              onClick={() => setOpenLoginId(null)}
                              className="text-xs text-neutral-500 underline hover:text-neutral-800"
                            >
                              Close
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
