"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NotesForm({ id, notes }: { id: string; notes: string }) {
  const router = useRouter();
  const [value, setValue] = useState(notes);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: value }),
      });
      if (!res.ok) {
        setMsg("Could not save notes.");
        return;
      }
      setMsg("Notes saved.");
      router.refresh();
    } catch {
      setMsg("Could not save notes.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="notes-form" onSubmit={onSave}>
      <label htmlFor="admin-notes">Internal notes</label>
      <textarea
        id="admin-notes"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={5}
        placeholder="Add recruiter notes about this candidate…"
      />
      <div className="notes-actions">
        <button
          type="submit"
          className="dash-btn"
          disabled={busy}
          style={{ boxShadow: busy ? "none" : undefined, opacity: busy ? 0.65 : undefined }}
        >
          {busy ? "Saving…" : "Save notes"}
        </button>
        {msg ? <span className="notes-msg">{msg}</span> : null}
      </div>
    </form>
  );
}
