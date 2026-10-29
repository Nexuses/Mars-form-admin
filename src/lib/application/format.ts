export function digits(s: string): string {
  return String(s).replace(/\D/g, "");
}

export function formatPhone(v: string): string {
  let d = digits(v);
  if (d.length > 10 && d.charAt(0) === "1") d = d.slice(1);
  d = d.slice(0, 10);
  if (d.length > 6) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length > 3) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  if (d.length) return `(${d}`;
  return "";
}

export function formatFileSize(b: number): string {
  return b < 1048576
    ? `${Math.max(1, Math.round(b / 1024))} KB`
    : `${(b / 1048576).toFixed(1)} MB`;
}

export function formatDisplayDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function todaySignatureDate(): string {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function adultDobMax(): string {
  const t = new Date();
  return isoDate(new Date(t.getFullYear() - 18, t.getMonth(), t.getDate()));
}
