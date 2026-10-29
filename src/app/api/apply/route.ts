import { connection } from "next/server";
import { NextResponse } from "next/server";
import { FORM_CONFIG } from "@/lib/application/config";
import { connectDb } from "@/lib/db";
import {
  buildApplicationEmailHtml,
  buildCandidateThankYouEmailHtml,
  buildCandidateThankYouText,
  createMailTransport,
  rowsToHtml,
} from "@/lib/mail";
import { saveApplicationFile } from "@/lib/uploads";
import { Application } from "@/models/Application";

type Attachment = {
  slot: "checklist" | "license" | "lifesupport" | "resume";
  filename: string;
  content: Buffer;
  contentType?: string;
};

function getAll(form: FormData, key: string): string[] {
  return form
    .getAll(key)
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean);
}

function getStr(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

async function collectFiles(
  form: FormData,
  slot: Attachment["slot"],
): Promise<Attachment[]> {
  const out: Attachment[] = [];
  for (const item of form.getAll(slot)) {
    if (!(item instanceof File) || item.size === 0) continue;
    const buf = Buffer.from(await item.arrayBuffer());
    out.push({
      slot,
      filename: item.name || `${slot}-${out.length + 1}`,
      content: buf,
      contentType: item.type || undefined,
    });
  }
  return out;
}

function refId(): string {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MARS-${stamp}-${rand}`;
}

export async function POST(request: Request) {
  try {
    await connection();
    const form = await request.formData();

    if (getStr(form, "company_website")) {
      return NextResponse.json({ ok: true, reference: refId() });
    }

    const fullName = getStr(form, "full_name");
    const email = getStr(form, "email");
    if (!fullName || !email) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    const emr = getAll(form, "emr").map((v) =>
      v === "Other" ? getStr(form, "emr_other") || "Other" : v,
    );
    const checklistIdx = getStr(form, "checklist_specialty");
    const checklistLabel =
      checklistIdx === "other"
        ? "Not listed (recruiter will send)"
        : checklistIdx !== "" && FORM_CONFIG.checklists[Number(checklistIdx)]
          ? FORM_CONFIG.checklists[Number(checklistIdx)].label
          : checklistIdx;

    const checklistMethod = getStr(form, "checklist_method");
    const checklistHow =
      checklistMethod === "phone"
        ? "Complete by phone with a recruiter"
        : checklistMethod === "upload"
          ? "Candidate will upload checklist"
          : "";

    const reference = refId();
    const client = getStr(form, "client");
    const submittedAtRaw = getStr(form, "submitted_at");
    const submittedAt = submittedAtRaw
      ? new Date(submittedAtRaw)
      : new Date();

    const fileBags: Attachment[] = [];
    for (const slot of ["checklist", "license", "lifesupport", "resume"] as const) {
      if (slot === "checklist" && checklistMethod !== "upload") continue;
      fileBags.push(...(await collectFiles(form, slot)));
    }

    await connectDb();

    const application = await Application.create({
      reference,
      status: "new",
      client,
      formVersion: getStr(form, "form_version") || "1.0",
      pageUrl: getStr(form, "page_url"),
      submittedAt: Number.isNaN(submittedAt.getTime()) ? new Date() : submittedAt,
      fullName,
      addressLine1: getStr(form, "address_line1"),
      addressLine2: getStr(form, "address_line2"),
      city: getStr(form, "city"),
      state: getStr(form, "state"),
      zip: getStr(form, "zip"),
      phone: getStr(form, "phone"),
      phoneAlt: getStr(form, "phone_alt"),
      email,
      emailAlt: getStr(form, "email_alt"),
      dob: getStr(form, "dob"),
      ssnLast4: getStr(form, "ssn_last4"),
      workAuth: getStr(form, "work_auth"),
      vehicle: getStr(form, "vehicle"),
      backgroundOk: getStr(form, "background_ok"),
      fluShot: getStr(form, "flu_shot"),
      startAsap: getStr(form, "start_asap"),
      startDate: getStr(form, "start_date"),
      daysOff: getStr(form, "days_off"),
      daysOffDetails: getStr(form, "days_off_details"),
      otherOffers: getStr(form, "other_offers"),
      otherOffersDetails: getStr(form, "other_offers_details"),
      interviewAvailability: getStr(form, "interview_availability"),
      profession: getStr(form, "profession"),
      specialty: getStr(form, "specialty"),
      licenseStates: getStr(form, "license_states"),
      educationLevel: getStr(form, "education_level"),
      educationField: getStr(form, "education_field"),
      educationSchool: getStr(form, "education_school"),
      educationYear: getStr(form, "education_year"),
      eduDocs: getStr(form, "edu_docs"),
      emr,
      emrOther: getStr(form, "emr_other"),
      priorClient: getStr(form, "prior_client"),
      priorClientDetails: getStr(form, "prior_client_details"),
      checklistSpecialty: checklistIdx,
      checklistLabel,
      checklistMethod,
      ref1Client: getStr(form, "ref1_client"),
      ref1Name: getStr(form, "ref1_name"),
      ref1Title: getStr(form, "ref1_title"),
      ref1Contact: getStr(form, "ref1_contact"),
      ref2Client: getStr(form, "ref2_client"),
      ref2Name: getStr(form, "ref2_name"),
      ref2Title: getStr(form, "ref2_title"),
      ref2Contact: getStr(form, "ref2_contact"),
      consent: getStr(form, "consent"),
      signature: getStr(form, "signature"),
      signatureDate: getStr(form, "signature_date"),
      attachments: [],
    });

    const savedAttachments = [];
    for (const file of fileBags) {
      const saved = await saveApplicationFile({
        applicationId: application._id.toString(),
        slot: file.slot,
        originalName: file.filename,
        content: file.content,
        contentType: file.contentType,
      });
      savedAttachments.push({
        slot: file.slot,
        originalName: file.filename,
        url: saved.url,
        contentType: file.contentType || "",
        size: file.content.length,
      });
    }

    if (savedAttachments.length) {
      await Application.findByIdAndUpdate(application._id, {
        $set: { attachments: savedAttachments },
      });
    }

    const sections = [
      rowsToHtml("Your details", [
        { label: "Full legal name", value: fullName },
        {
          label: "Address",
          value: [
            getStr(form, "address_line1"),
            getStr(form, "address_line2"),
            [getStr(form, "city"), getStr(form, "state"), getStr(form, "zip")]
              .filter(Boolean)
              .join(", "),
          ]
            .filter(Boolean)
            .join(", "),
        },
        {
          label: "Phone",
          value: [getStr(form, "phone"), getStr(form, "phone_alt")]
            .filter(Boolean)
            .join(" / "),
        },
        {
          label: "Email",
          value: [email, getStr(form, "email_alt")].filter(Boolean).join(" / "),
        },
        { label: "Date of birth", value: getStr(form, "dob") },
        {
          label: "SSN (last 4)",
          value: getStr(form, "ssn_last4")
            ? `****${getStr(form, "ssn_last4")}`
            : "",
        },
      ]),
      rowsToHtml("Eligibility and availability", [
        { label: "Authorized to work in the US", value: getStr(form, "work_auth") },
        { label: "Own vehicle", value: getStr(form, "vehicle") },
        {
          label: "Background check and drug test",
          value: getStr(form, "background_ok"),
        },
        { label: "Flu shot", value: getStr(form, "flu_shot") },
        {
          label: "Start ASAP",
          value:
            getStr(form, "start_asap") === "Yes"
              ? "Yes"
              : getStr(form, "start_date")
                ? `No — earliest ${getStr(form, "start_date")}`
                : getStr(form, "start_asap"),
        },
        {
          label: "Days off in first 13 weeks",
          value:
            getStr(form, "days_off") === "Yes"
              ? `Yes: ${getStr(form, "days_off_details")}`
              : getStr(form, "days_off"),
        },
        {
          label: "Other offers or interviews",
          value:
            getStr(form, "other_offers") === "Yes"
              ? `Yes: ${getStr(form, "other_offers_details")}`
              : getStr(form, "other_offers"),
        },
        {
          label: "Interview availability",
          value: getStr(form, "interview_availability"),
        },
      ]),
      rowsToHtml("Experience and credentials", [
        {
          label: "Profession",
          value: [getStr(form, "profession"), getStr(form, "specialty")]
            .filter(Boolean)
            .join(", "),
        },
        { label: "License state(s)", value: getStr(form, "license_states") },
        {
          label: "Education",
          value: [
            getStr(form, "education_level"),
            getStr(form, "education_field"),
            getStr(form, "education_school"),
            getStr(form, "education_year"),
          ]
            .filter(Boolean)
            .join(", "),
        },
        {
          label: "Education documents available",
          value: getStr(form, "edu_docs"),
        },
        { label: "EMR / EHR systems", value: emr.join(", ") },
        ...(client
          ? [
              {
                label: `Worked with ${client}`,
                value:
                  getStr(form, "prior_client") === "Yes"
                    ? `Yes: ${getStr(form, "prior_client_details")}`
                    : getStr(form, "prior_client"),
              },
            ]
          : []),
      ]),
      rowsToHtml("Skills checklist", [
        { label: "Checklist", value: checklistLabel },
        { label: "Completion", value: checklistHow },
      ]),
      rowsToHtml("References", [
        {
          label: "Reference 1",
          value: [
            getStr(form, "ref1_name"),
            getStr(form, "ref1_title"),
            getStr(form, "ref1_client"),
            getStr(form, "ref1_contact"),
          ]
            .filter(Boolean)
            .join(", "),
        },
        {
          label: "Reference 2",
          value: [
            getStr(form, "ref2_name"),
            getStr(form, "ref2_title"),
            getStr(form, "ref2_client"),
            getStr(form, "ref2_contact"),
          ]
            .filter(Boolean)
            .join(", "),
        },
      ]),
      rowsToHtml("Confirmation", [
        { label: "Consent", value: getStr(form, "consent") },
        { label: "Signature", value: getStr(form, "signature") },
        { label: "Signature date", value: getStr(form, "signature_date") },
        { label: "Submitted at", value: getStr(form, "submitted_at") },
        { label: "Page URL", value: getStr(form, "page_url") },
        { label: "Client", value: client },
        { label: "Form version", value: getStr(form, "form_version") },
        {
          label: "Attachments",
          value: fileBags.map((a) => a.filename).join(", ") || "None",
        },
      ]),
    ]
      .filter(Boolean)
      .join("");

    const html = buildApplicationEmailHtml({
      reference,
      fullName,
      client: client || undefined,
      sectionsHtml: sections,
    });

    const textLines = [
      `New healthcare candidate application`,
      `Reference: ${reference}`,
      ``,
      `Name: ${fullName}`,
      `Email: ${email}`,
      `Phone: ${getStr(form, "phone")}`,
      client ? `Client: ${client}` : "",
      `Attachments: ${fileBags.map((a) => a.filename).join(", ") || "None"}`,
    ].filter(Boolean);

    const from = process.env.FROM_EMAIL || "noreply@example.com";
    const to = process.env.MAIL_TO;
    const replyTeam = to || from;

    try {
      const transport = createMailTransport();

      if (to) {
        try {
          await transport.sendMail({
            from: `MARS Applications <${from}>`,
            to,
            replyTo: email,
            subject: `MARS application — ${fullName}${client ? ` (${client})` : ""} [${reference}]`,
            text: textLines.join("\n"),
            html,
            attachments: fileBags.map((a) => ({
              filename: `${a.slot}-${a.filename}`,
              content: a.content,
              contentType: a.contentType,
            })),
          });
        } catch (mailErr) {
          console.error("apply admin email failed (application still saved):", mailErr);
        }
      }

      try {
        const thankYou = await transport.sendMail({
          from: `MARS Solutions Group <${from}>`,
          to: email,
          replyTo: replyTeam,
          subject: `Thank you for your application — ${reference}`,
          text: buildCandidateThankYouText({
            reference,
            fullName,
            client: client || undefined,
          }),
          html: buildCandidateThankYouEmailHtml({
            reference,
            fullName,
            client: client || undefined,
          }),
        });
        console.info(
          `apply thank-you email sent to ${email} messageId=${thankYou.messageId || "n/a"} reference=${reference}`,
        );
      } catch (thankYouErr) {
        console.error(
          "apply thank-you email failed (application still saved):",
          thankYouErr,
        );
      }
    } catch (mailErr) {
      console.error("apply mail transport failed (application still saved):", mailErr);
    }

    return NextResponse.json({
      ok: true,
      reference,
      id: application._id.toString(),
    });
  } catch (err) {
    console.error("apply route error:", err);
    return NextResponse.json(
      { error: "Failed to submit application." },
      { status: 500 },
    );
  }
}
