"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddEmployeeForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [availabilityPct, setAvailabilityPct] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, role, location, availabilityPct }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to add resource");
      return;
    }
    setName("");
    setRole("");
    setLocation("");
    setAvailabilityPct(100);
    router.refresh();
  }

  return (
    <div className="card space-y-3">
      <h3 className="font-semibold">Add a resource</h3>
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-2 sm:grid-cols-5 sm:items-end">
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-neutral-500">Name</label>
          <input
            required
            className="mt-1 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-neutral-500">Role</label>
          <input
            required
            className="mt-1 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="AI Engineer"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-neutral-500">Location</label>
          <input
            required
            className="mt-1 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="text-xs font-semibold text-neutral-500">Availability %</label>
            <input
              type="number"
              min={0}
              max={100}
              className="mt-1 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
              value={availabilityPct}
              onChange={(e) => setAvailabilityPct(Number(e.target.value))}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
