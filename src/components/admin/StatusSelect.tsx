"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUSES = [
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "contacted", label: "Contacted" },
  { value: "placed", label: "Placed" },
  { value: "archived", label: "Archived" },
] as const;

export function StatusSelect({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onChange(next: string) {
    setBusy(true);
    setError("");
    const prev = value;
    setValue(next);
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        setValue(prev);
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Could not update status.");
        return;
      }
      router.refresh();
    } catch {
      setValue(prev);
      setError("Could not update status.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="status-select-wrap">
      <select
        className={`status-select status-${value}`}
        value={value}
        disabled={busy}
        onChange={(e) => void onChange(e.target.value)}
        aria-label="Application status"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {error ? <p className="admin-err">{error}</p> : null}
    </div>
  );
}
