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
  const [value, setValue] = useState(stage);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function onChange(next: string) {
    setValue(next);
    await fetch(`/api/pipeline/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: next }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => onChange(e.target.value)}
      className={`badge cursor-pointer border-0 ${STAGE_COLOR[value]}`}
    >
      {STAGES.map((s) => (
        <option key={s} value={s}>
          {s.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}
