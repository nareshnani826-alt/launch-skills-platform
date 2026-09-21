"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const STAGES = ["PLANNED", "REGISTERED", "IN_LEARNING", "EXAM_SCHEDULED", "CERTIFIED", "RENEWAL_DUE"];

const STAGE_COLOR: Record<string, string> = {
  PLANNED: "bg-neutral-100 text-neutral-700",
  REGISTERED: "bg-blue-100 text-blue-700",
  IN_LEARNING: "bg-indigo-100 text-indigo-700",
  EXAM_SCHEDULED: "bg-amber-100 text-amber-700",
  CERTIFIED: "bg-emerald-100 text-emerald-700",
  RENEWAL_DUE: "bg-red-100 text-red-700",
};

export default function StageSelect({ id, stage }: { id: string; stage: string }) {
  const [saved, setSaved] = useState(stage);
  const [value, setValue] = useState(stage);
  const [pending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const dirty = value !== saved;

  async function onSave() {
    setSaving(true);
    await fetch(`/api/pipeline/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: value }),
    });
    setSaved(value);
    setSaving(false);
    startTransition(() => router.refresh());
  }

  function onCancel() {
    setValue(saved);
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        disabled={saving || pending}
        onChange={(e) => setValue(e.target.value)}
        className={`badge cursor-pointer border-0 ${STAGE_COLOR[value]}`}
      >
        {STAGES.map((s) => (
          <option key={s} value={s}>
            {s.replace("_", " ")}
          </option>
        ))}
      </select>
      {dirty && (
        <span className="flex items-center gap-1">
          <button
            onClick={onSave}
            disabled={saving || pending}
            className="rounded bg-accent px-2 py-0.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={onCancel}
            disabled={saving || pending}
            className="rounded border border-neutral-300 px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </span>
      )}
    </div>
  );
}
