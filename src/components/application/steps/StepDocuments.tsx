"use client";

import { FORM_CONFIG } from "@/lib/application/config";
import { formatDisplayDate } from "@/lib/application/format";
import type { FieldErrors, FileStore, FormValues } from "@/lib/application/types";
import { FieldWrap, FileDrop, ReqMark } from "../ui";

type ReviewSection = {
  title: string;
  step: number;
  rows: [string, string][];
};

function buildReview(
  values: FormValues,
  files: FileStore,
): ReviewSection[] {
  const addr = [values.address_line1, values.address_line2]
    .filter(Boolean)
    .join(", ");
  const city = [values.city, `${values.state} ${values.zip}`.trim()]
    .filter((x) => x.trim())
    .join(", ");
  const phones = [values.phone, values.phone_alt].filter(Boolean).join(" / ");
  const emails = [values.email, values.email_alt].filter(Boolean).join(" / ");
  const chk = values.checklist_specialty;
  const chkLabel =
    chk === "other"
      ? "Not listed (recruiter will send)"
      : chk !== "" && FORM_CONFIG.checklists[Number(chk)]
        ? FORM_CONFIG.checklists[Number(chk)].label
        : "";
  const fileNames = (slot: keyof FileStore) =>
    (files[slot] || []).map((f) => f.name).join(", ");
  const chkHow =
    values.checklist_method === "phone"
      ? "Complete by phone with a recruiter"
      : values.checklist_method === "upload"
        ? `Upload: ${fileNames("checklist") || "none"}`
        : "";
  const emrList = values.emr
    .map((v) => (v === "Other" ? values.emr_other || "Other" : v))
    .join(", ");

  return [
    {
      title: "Your details",
      step: 0,
      rows: [
        ["Full legal name", values.full_name],
        ["Address", [addr, city].filter(Boolean).join(", ")],
        ["Phone", phones],
        ["Email", emails],
        ["Date of birth", formatDisplayDate(values.dob)],
        ["SSN", values.ssn_last4 ? "Last 4 digits provided" : ""],
      ],
    },
    {
      title: "Eligibility and availability",
      step: 1,
      rows: [
        ["Authorized to work in the US", values.work_auth],
        ["Own vehicle", values.vehicle],
        ["Background check and drug test", values.background_ok],
        ["Flu shot", values.flu_shot],
        [
          "Start",
          values.start_asap === "Yes"
            ? "As soon as possible"
            : values.start_date
              ? `From ${formatDisplayDate(values.start_date)}`
              : "",
        ],
        [
          "Days off in first 13 weeks",
          values.days_off === "Yes"
            ? `Yes: ${values.days_off_details}`
            : values.days_off,
        ],
        [
          "Other offers or interviews",
          values.other_offers === "Yes"
            ? `Yes: ${values.other_offers_details}`
            : values.other_offers,
        ],
        ["Interview availability", values.interview_availability],
      ],
    },
    {
      title: "Experience and credentials",
      step: 2,
      rows: [
        [
          "Profession",
          [values.profession, values.specialty].filter(Boolean).join(", "),
        ],
        ["License state(s)", values.license_states],
        [
          "Education",
          [
            values.education_level,
            values.education_field,
            values.education_school,
            values.education_year,
          ]
            .filter(Boolean)
            .join(", "),
        ],
        ["Education documents available", values.edu_docs],
        ["EMR / EHR systems", emrList],
        ...(values.client
          ? ([
              [
                `Worked with ${values.client}`,
                values.prior_client === "Yes"
                  ? `Yes: ${values.prior_client_details}`
                  : values.prior_client,
              ],
            ] as [string, string][])
          : []),
      ],
    },
    {
      title: "Skills checklist",
      step: 3,
      rows: [
        ["Checklist", chkLabel],
        ["Completion", chkHow],
      ],
    },
    {
      title: "References",
      step: 4,
      rows: [
        [
          "Reference 1",
          [
            values.ref1_name,
            values.ref1_title,
            values.ref1_client,
            values.ref1_contact,
          ]
            .filter(Boolean)
            .join(", "),
        ],
        [
          "Reference 2",
          [
            values.ref2_name,
            values.ref2_title,
            values.ref2_client,
            values.ref2_contact,
          ]
            .filter(Boolean)
            .join(", "),
        ],
      ],
    },
    {
      title: "Documents",
      step: 5,
      rows: [
        ["License and certificates", fileNames("license")],
        ["Life support certification", fileNames("lifesupport")],
        ["Resume", fileNames("resume")],
      ],
    },
  ];
}

export function StepDocuments({
  values,
  errors,
  files,
  submitError,
  onChange,
  onFiles,
  onEdit,
}: {
  values: FormValues;
  errors: FieldErrors;
  files: FileStore;
  submitError?: string;
  onChange: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void;
  onFiles: (
    slot: "license" | "lifesupport" | "resume",
    next: File[],
    message?: string,
  ) => void;
  onEdit: (step: number) => void;
}) {
  const sections = buildReview(values, files);

  return (
    <section className="step" aria-labelledby="h-6">
      <h2 id="h-6" tabIndex={-1}>
        Documents and review
      </h2>
      <p className="step-lead">
        Upload your credentials, check your answers, then submit.
      </p>

      <div className="group">
        <h3>Credentials</h3>
        <p className="hint" style={{ marginBottom: 16 }}>
          PDF, JPG, PNG or HEIC, up to 10 MB per file. Make sure names, numbers
          and expiry dates are readable.
        </p>
        <div className="stack">
          <FileDrop
            id="file-license"
            label="Professional license and certificates"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.heic,application/pdf,image/*"
            files={files.license}
            error={errors.license}
            onChange={(next, message) => onFiles("license", next, message)}
          />
          <FileDrop
            id="file-lifesupport"
            label="Life support certification (BLS, ACLS or equivalent)"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.heic,application/pdf,image/*"
            files={files.lifesupport}
            error={errors.lifesupport}
            onChange={(next, message) => onFiles("lifesupport", next, message)}
          />
          <FileDrop
            id="file-resume"
            label="Resume"
            optional
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,image/*"
            files={files.resume}
            error={errors.resume}
            onChange={(next, message) => onFiles("resume", next, message)}
          />
        </div>
      </div>

      <div className="group">
        <h3>Review your answers</h3>
        <p className="hint" style={{ marginBottom: 14 }}>
          Select Edit on any section to change it.
        </p>
        <div className="review">
          {sections.map((s) => {
            const rows = s.rows.filter((r) => r[1]);
            return (
              <div className="review-section" key={s.title}>
                <div className="review-head">
                  <h3>{s.title}</h3>
                  <button
                    type="button"
                    className="link-btn"
                    aria-label={`Edit ${s.title}`}
                    onClick={() => onEdit(s.step)}
                  >
                    Edit
                  </button>
                </div>
                {rows.length === 0 ? (
                  <p className="hint" style={{ margin: 0 }}>
                    Nothing added yet.
                  </p>
                ) : (
                  <dl>
                    {rows.map(([k, v]) => (
                      <div key={k} style={{ display: "contents" }}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="group">
        <h3>Confirmation</h3>
        <FieldWrap error={errors.consent}>
          <div className="consent">
            <input
              type="checkbox"
              id="consent"
              name="consent"
              value="Yes"
              checked={values.consent}
              onChange={(e) => onChange("consent", e.target.checked)}
            />
            <label htmlFor="consent">
              I confirm that the information I have given is accurate and
              complete. I authorize MARS Solutions Group to verify it, including
              by contacting my references, and to share it with prospective
              clients for placement purposes.
              <ReqMark />
            </label>
          </div>
        </FieldWrap>
        <div className="grid" style={{ marginTop: 22 }}>
          <FieldWrap error={errors.signature}>
            <label htmlFor="signature">
              Type your full legal name as your signature
              <ReqMark />
            </label>
            <input
              type="text"
              id="signature"
              name="signature"
              autoComplete="off"
              maxLength={120}
              aria-required
              value={values.signature}
              onChange={(e) => onChange("signature", e.target.value)}
            />
          </FieldWrap>
          <FieldWrap>
            <label htmlFor="signature_date">Date</label>
            <input
              type="text"
              id="signature_date"
              name="signature_date"
              readOnly
              value={values.signature_date}
            />
          </FieldWrap>
        </div>
        <p className="fineprint">
          Your details are used only for recruitment and placement, as described
          in our{" "}
          <a
            href="https://www.marssg.com/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>

      {submitError ? (
        <div className="note alert" role="alert" style={{ marginTop: 24 }}>
          <p>{submitError}</p>
        </div>
      ) : null}
    </section>
  );
}
