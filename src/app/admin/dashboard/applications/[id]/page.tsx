import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { NotesForm } from "@/components/admin/NotesForm";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { connectDb } from "@/lib/db";
import { Application } from "@/models/Application";

export const instant = false;

function formatDate(d: Date | string | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="detail-section">
      <h2>{title}</h2>
      <dl className="detail-dl">{children}</dl>
    </section>
  );
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  await connectDb();
  const app = await Application.findById(id).lean();
  if (!app) notFound();

  const address = [
    app.addressLine1,
    app.addressLine2,
    [app.city, app.state, app.zip].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(", ");

  const checklistHow =
    app.checklistMethod === "phone"
      ? "Complete by phone with a recruiter"
      : app.checklistMethod === "upload"
        ? "Uploaded with application"
        : app.checklistMethod;

  return (
    <>
      <div className="dash-page-head">
        <div>
          <p className="dash-crumb">
            <Link href="/admin/dashboard/applications">Applications</Link>
            <span aria-hidden="true">/</span>
            <span>{app.reference}</span>
          </p>
          <h1>{app.fullName}</h1>
          <p>
            {app.email}
            {app.phone ? ` · ${app.phone}` : ""}
            {app.profession ? ` · ${app.profession}` : ""}
          </p>
        </div>
        <StatusSelect id={String(app._id)} status={app.status} />
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <Section title="Your details">
            <Row label="Full legal name" value={app.fullName} />
            <Row label="Address" value={address} />
            <Row
              label="Phone"
              value={[app.phone, app.phoneAlt].filter(Boolean).join(" / ")}
            />
            <Row
              label="Email"
              value={[app.email, app.emailAlt].filter(Boolean).join(" / ")}
            />
            <Row label="Date of birth" value={app.dob} />
            <Row
              label="SSN (last 4)"
              value={app.ssnLast4 ? `****${app.ssnLast4}` : ""}
            />
          </Section>

          <Section title="Eligibility and availability">
            <Row label="Authorized to work in the US" value={app.workAuth} />
            <Row label="Own vehicle" value={app.vehicle} />
            <Row
              label="Background check and drug test"
              value={app.backgroundOk}
            />
            <Row label="Flu shot" value={app.fluShot} />
            <Row
              label="Start"
              value={
                app.startAsap === "Yes"
                  ? "As soon as possible"
                  : app.startDate
                    ? `From ${app.startDate}`
                    : app.startAsap
              }
            />
            <Row
              label="Days off in first 13 weeks"
              value={
                app.daysOff === "Yes"
                  ? `Yes: ${app.daysOffDetails}`
                  : app.daysOff
              }
            />
            <Row
              label="Other offers or interviews"
              value={
                app.otherOffers === "Yes"
                  ? `Yes: ${app.otherOffersDetails}`
                  : app.otherOffers
              }
            />
            <Row
              label="Interview availability"
              value={app.interviewAvailability}
            />
          </Section>

          <Section title="Experience and credentials">
            <Row
              label="Profession"
              value={[app.profession, app.specialty].filter(Boolean).join(", ")}
            />
            <Row label="License state(s)" value={app.licenseStates} />
            <Row
              label="Education"
              value={[
                app.educationLevel,
                app.educationField,
                app.educationSchool,
                app.educationYear,
              ]
                .filter(Boolean)
                .join(", ")}
            />
            <Row label="Education documents available" value={app.eduDocs} />
            <Row label="EMR / EHR systems" value={(app.emr || []).join(", ")} />
            {app.client ? (
              <Row
                label={`Worked with ${app.client}`}
                value={
                  app.priorClient === "Yes"
                    ? `Yes: ${app.priorClientDetails}`
                    : app.priorClient
                }
              />
            ) : null}
          </Section>

          <Section title="Skills checklist">
            <Row label="Checklist" value={app.checklistLabel} />
            <Row label="Completion" value={checklistHow} />
          </Section>

          <Section title="References">
            <Row
              label="Reference 1"
              value={[
                app.ref1Name,
                app.ref1Title,
                app.ref1Client,
                app.ref1Contact,
              ]
                .filter(Boolean)
                .join(", ")}
            />
            <Row
              label="Reference 2"
              value={[
                app.ref2Name,
                app.ref2Title,
                app.ref2Client,
                app.ref2Contact,
              ]
                .filter(Boolean)
                .join(", ")}
            />
          </Section>

          <Section title="Confirmation">
            <Row label="Consent" value={app.consent} />
            <Row label="Signature" value={app.signature} />
            <Row label="Signature date" value={app.signatureDate} />
            <Row label="Submitted" value={formatDate(app.submittedAt)} />
            <Row label="Client" value={app.client} />
            <Row label="Form version" value={app.formVersion} />
            <Row label="Page URL" value={app.pageUrl} />
          </Section>
        </div>

        <aside className="detail-side">
          <section className="detail-section">
            <h2>Documents</h2>
            {(app.attachments || []).length === 0 ? (
              <p className="dash-empty" style={{ padding: 0 }}>
                No files uploaded.
              </p>
            ) : (
              <ul className="file-list">
                {(app.attachments || []).map(
                  (file: {
                    _id?: unknown;
                    originalName: string;
                    slot: string;
                    size?: number;
                    url?: string;
                  }) => (
                    <li key={String(file._id)}>
                      <div>
                        <strong>{file.originalName}</strong>
                        <span>
                          {file.slot} · {formatBytes(file.size || 0)}
                        </span>
                      </div>
                      <a
                        className="dash-link"
                        href={`/api/admin/applications/${String(app._id)}/files/${String(file._id)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                    </li>
                  ),
                )}
              </ul>
            )}
          </section>

          <section className="detail-section">
            <h2>Recruiter notes</h2>
            <NotesForm id={String(app._id)} notes={app.notes || ""} />
          </section>
        </aside>
      </div>
    </>
  );
}
