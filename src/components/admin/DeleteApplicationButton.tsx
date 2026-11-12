"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteApplicationButton({
  id,
  name,
  redirectTo,
  compact = false,
}: {
  id: string;
  name: string;
  redirectTo?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onDelete() {
    const ok = window.confirm(
      `Delete application for ${name}? This cannot be undone.`,
    );
    if (!ok) return;

    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Could not delete application.");
        return;
      }
      if (redirectTo) {
        window.location.assign(redirectTo);
        return;
      }
      router.refresh();
    } catch {
      setError("Could not delete application.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="dash-delete-wrap">
      <button
        type="button"
        className={compact ? "dash-link-danger" : "dash-btn-danger"}
        disabled={busy}
        onClick={() => void onDelete()}
      >
        {busy ? "Deleting…" : "Delete"}
      </button>
      {error ? <span className="admin-err">{error}</span> : null}
    </span>
  );
}
