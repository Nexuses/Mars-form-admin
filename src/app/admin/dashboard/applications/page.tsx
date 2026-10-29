import Link from "next/link";
import { connection } from "next/server";
import { connectDb } from "@/lib/db";
import { Application } from "@/models/Application";

export const instant = false;

function formatDate(d: Date | string | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await connection();
  const params = await searchParams;
  const q = (params.q || "").trim();
  const status = (params.status || "").trim();

  await connectDb();

  const filter: Record<string, unknown> = {};
  if (status && status !== "all") filter.status = status;
  if (q) {
    filter.$or = [
      { fullName: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
      { email: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
      { reference: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
      { profession: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
      { phone: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
    ];
  }

  const apps = await Application.find(filter)
    .sort({ submittedAt: -1 })
    .limit(200)
    .select(
      "reference fullName email phone profession specialty city state status submittedAt client checklistLabel",
    )
    .lean();

  return (
    <>
      <div className="dash-page-head">
        <div>
          <h1>Applications</h1>
          <p>Search and review every candidate submission in one place.</p>
        </div>
      </div>

      <form className="dash-filters" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search name, email, reference, profession…"
          aria-label="Search applications"
        />
        <select name="status" defaultValue={status || "all"} aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="reviewing">Reviewing</option>
          <option value="contacted">Contacted</option>
          <option value="placed">Placed</option>
          <option value="archived">Archived</option>
        </select>
        <button type="submit" className="dash-btn">
          Apply filters
        </button>
      </form>

      <section className="dash-panel">
        <div className="dash-panel-head">
          <h2>
            {apps.length} result{apps.length === 1 ? "" : "s"}
          </h2>
        </div>
        {apps.length === 0 ? (
          <p className="dash-empty">No applications match your filters.</p>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => (
                  <tr key={String(app._id)}>
                    <td>
                      <div className="dash-cell-main">{app.fullName}</div>
                      <div className="dash-cell-sub">{app.reference}</div>
                    </td>
                    <td>
                      <div className="dash-cell-main">{app.email}</div>
                      <div className="dash-cell-sub">{app.phone || "—"}</div>
                    </td>
                    <td>
                      <div className="dash-cell-main">
                        {app.profession || "—"}
                      </div>
                      <div className="dash-cell-sub">
                        {[app.specialty, app.checklistLabel, app.client]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </div>
                    </td>
                    <td>
                      {[app.city, app.state].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td>
                      <span className={`pill pill-${app.status}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>{formatDate(app.submittedAt)}</td>
                    <td>
                      <Link
                        href={`/admin/dashboard/applications/${String(app._id)}`}
                        className="dash-link"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
