"use client";

import { useMemo, useState } from "react";
import StageSelect from "@/components/StageSelect";
import TargetDateEdit from "@/components/TargetDateEdit";

type Row = {
  id: string;
  stage: string;
  targetDate: string | null;
  employeeName: string;
  employeeRole: string;
  certName: string;
  certPartner: string;
};

const STAGES = ["PLANNED", "REGISTERED", "IN_LEARNING", "EXAM_SCHEDULED", "CERTIFIED", "RENEWAL_DUE"] as const;
const PAGE_SIZE = 10;

export default function PipelineTable({ rows }: { rows: Row[] }) {
  const [stageFilter, setStageFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.stage] = (counts[r.stage] ?? 0) + 1;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (stageFilter && r.stage !== stageFilter) return false;
      if (q && !r.employeeName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, stageFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function toggleStage(s: string) {
    setStageFilter((prev) => (prev === s ? null : s));
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {STAGES.map((s) => {
          const active = stageFilter === s;
          return (
            <button
              key={s}
              onClick={() => toggleStage(s)}
              className={`card text-center transition-colors ${
                active ? "ring-2 ring-accent" : "hover:bg-neutral-50"
              }`}
            >
              <div className="text-2xl font-semibold">{counts[s] ?? 0}</div>
              <div className="text-xs text-neutral-500">{s.replace("_", " ")}</div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by employee name..."
          className="w-64 rounded border border-neutral-300 px-2 py-1.5 text-sm"
        />
        {(stageFilter || search) && (
          <button
            onClick={() => {
              setStageFilter(null);
              setSearch("");
              setPage(1);
            }}
            className="text-xs text-neutral-500 underline hover:text-neutral-800"
          >
            Clear filters
          </button>
        )}
        <span className="text-xs text-neutral-400">
          {filtered.length} of {rows.length} rows
        </span>
      </div>

      <div className="card overflow-x-auto">
        <table className="data w-full">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Role</th>
              <th>Certification</th>
              <th>Partner</th>
              <th>Stage</th>
              <th>Target date</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <tr key={r.id}>
                <td>{r.employeeName}</td>
                <td>{r.employeeRole}</td>
                <td>{r.certName}</td>
                <td>{r.certPartner}</td>
                <td>
                  <StageSelect id={r.id} stage={r.stage} />
                </td>
                <td>
                  <TargetDateEdit id={r.id} targetDate={r.targetDate} />
                </td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-neutral-400">
                  No matching rows.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded border border-neutral-300 px-3 py-1 hover:bg-neutral-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded border border-neutral-300 px-3 py-1 hover:bg-neutral-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
