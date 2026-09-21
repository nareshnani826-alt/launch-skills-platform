"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

function toInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export default function TargetDateEdit({ id, targetDate }: { id: string; targetDate: string | null }) {
  const initial = toInputValue(targetDate);
  const [saved, setSaved] = useState(initial);
  const [value, setValue] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const dirty = value !== saved;

  async function onSave() {
    setSaving(true);
    await fetch(`/api/pipeline/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetDate: value || null }),
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
      <input
        type="date"
        value={value}
        disabled={saving || pending}
        onChange={(e) => setValue(e.target.value)}
        className="rounded border border-neutral-300 px-1.5 py-0.5 text-xs"
      />
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
