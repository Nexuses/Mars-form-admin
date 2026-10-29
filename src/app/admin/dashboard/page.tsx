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
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminOverviewPage() {
  await connection();
  await connectDb();

  const [
    total,
    newCount,
    reviewing,
    contacted,
    placed,
    recent,
  ] = await Promise.all([
    Application.countDocuments(),
    Application.countDocuments({ status: "new" }),
    Application.countDocuments({ status: "reviewing" }),
    Application.countDocuments({ status: "contacted" }),
    Application.countDocuments({ status: "placed" }),
    Application.find()
      .sort({ submittedAt: -1 })
      .limit(8)
      .select(
        "reference fullName email profession status submittedAt client city state",
      )
      .lean(),
  ]);

  const stats = [
    { label: "Total applications", value: total, tone: "total" },
    { label: "New", value: newCount, tone: "new" },
    { label: "Reviewing", value: reviewing, tone: "reviewing" },
    { label: "Contacted", value: contacted, tone: "contacted" },
    { label: "Placed", value: placed, tone: "placed" },
  ];

  return (
    <>
      <div className="dash-page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Monitor candidate applications submitted through the MARS form.</p>
        </div>
        <Link href="/admin/dashboard/applications" className="dash-btn">
          View all applications
        </Link>
      </div>

      <div className="dash-stats">
        {stats.map((s) => (
          <div className="dash-stat" key={s.label} data-tone={s.tone}>
            <span>{s.label}</span>
            <strong>{s.value}</strong>
          </div>
        ))}
      </div>

      <section className="dash-panel">
        <div className="dash-panel-head">
          <h2>Recent applications</h2>
        </div>
        {recent.length === 0 ? (
          <p className="dash-empty">
            No applications yet. New submissions from the public form will appear
            here.
          </p>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Profession</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((app) => (
                  <tr key={String(app._id)}>
                    <td>
                      <div className="dash-cell-main">{app.fullName}</div>
                      <div className="dash-cell-sub">
                        {app.reference} · {app.email}
                      </div>
                    </td>
                    <td>
                      {app.profession || "—"}
                      {app.client ? (
                        <div className="dash-cell-sub">Client: {app.client}</div>
                      ) : null}
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
                        Open
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
