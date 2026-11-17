import { FORM_CONFIG } from "./config";
import { digits } from "./format";
import type { FieldErrors, FileStore, FormValues } from "./types";

const RX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isVisible(when: string | undefined, values: FormValues): boolean {
  if (!when) return true;
  const [name, expected] = when.split("=");
  if (name === "emr") return values.emr.includes(expected);
  return (values as Record<string, unknown>)[name] === expected;
}

type Rule = {
  key: string;
  step: number;
  required?: boolean | ((v: FormValues) => boolean);
  when?: string;
  type?:
    | "email"
    | "phone"
    | "zip"
    | "ssn4"
    | "dob"
    | "futuredate"
    | "year"
    | "contact"
    | "radio"
    | "checkbox"
    | "select"
    | "consent"
    | "emr"
    | "file";
  slot?: keyof FileStore;
  label?: string;
};

const LABELS: Record<string, string> = {
  full_name: "full legal name",
  address_line1: "street address",
  city: "city",
  state: "state",
  zip: "ZIP code",
  phone: "phone number",
  phone_alt: "alternate phone",
  email: "email address",
  email_alt: "alternate email",
  dob: "date of birth",
  ssn_last4: "last 4 digits of SSN",
  work_auth: "work authorization",
  vehicle: "vehicle",
  background_ok: "background check answer",
  flu_shot: "flu shot answer",
  start_asap: "start date preference",
  start_date: "earliest start date",
  days_off: "days-off answer",
  days_off_details: "days-off details",
  other_offers: "other offers answer",
  other_offers_details: "other offers details",
  interview_availability: "interview availability",
  profession: "profession",
  education_level: "education level",
  education_field: "field of study",
  education_school: "school name",
  education_year: "graduation year",
  edu_docs: "education documents answer",
  emr: "EMR / EHR systems",
  emr_other: "other EMR system",
  prior_client: "prior client answer",
  prior_client_details: "prior client details",
  checklist_specialty: "skills checklist",
  checklist_method: "checklist completion method",
  checklist: "skills checklist file",
  ref1_client: "reference 1 facility",
  ref1_name: "reference 1 name",
  ref1_title: "reference 1 title",
  ref1_contact: "reference 1 contact",
  ref2_client: "reference 2 facility",
  ref2_name: "reference 2 name",
  ref2_title: "reference 2 title",
  ref2_contact: "reference 2 contact",
  license: "license / certificates",
  lifesupport: "life support certification",
  resume: "resume",
  consent: "consent",
  signature: "signature",
};

const RULES: Rule[] = [
  { key: "full_name", step: 0, required: true },
  { key: "address_line1", step: 0, required: true },
  { key: "city", step: 0, required: true },
  { key: "state", step: 0, required: true, type: "select" },
  { key: "zip", step: 0, required: true, type: "zip" },
  { key: "phone", step: 0, required: true, type: "phone" },
  { key: "phone_alt", step: 0, type: "phone" },
  { key: "email", step: 0, required: true, type: "email" },
  { key: "email_alt", step: 0, type: "email" },
  { key: "dob", step: 0, required: true, type: "dob" },
  { key: "ssn_last4", step: 0, required: true, type: "ssn4" },

  { key: "work_auth", step: 1, required: true, type: "radio" },
  { key: "vehicle", step: 1, required: true, type: "radio" },
  { key: "background_ok", step: 1, required: true, type: "radio" },
  { key: "flu_shot", step: 1, required: true, type: "radio" },
  { key: "start_asap", step: 1, required: true, type: "radio" },
  {
    key: "start_date",
    step: 1,
    required: true,
    type: "futuredate",
    when: "start_asap=No",
  },
  { key: "days_off", step: 1, required: true, type: "radio" },
  {
    key: "days_off_details",
    step: 1,
    required: true,
    when: "days_off=Yes",
  },
  { key: "other_offers", step: 1, required: true, type: "radio" },
  {
    key: "other_offers_details",
    step: 1,
    required: true,
    when: "other_offers=Yes",
  },
  { key: "interview_availability", step: 1, required: true },

  { key: "profession", step: 2, required: true, type: "select" },
  { key: "education_level", step: 2, required: true, type: "select" },
  { key: "education_field", step: 2, required: true },
  { key: "education_school", step: 2, required: true },
  { key: "education_year", step: 2, type: "year" },
  { key: "edu_docs", step: 2, required: true, type: "radio" },
  { key: "emr", step: 2, required: true, type: "emr" },
  {
    key: "emr_other",
    step: 2,
    required: true,
    when: "emr=Other",
  },
  {
    key: "prior_client",
    step: 2,
    required: (v) => !!v.client,
    type: "radio",
  },
  {
    key: "prior_client_details",
    step: 2,
    required: true,
    when: "prior_client=Yes",
  },

  { key: "checklist_specialty", step: 3, required: true, type: "select" },
  {
    key: "checklist_method",
    step: 3,
    required: (v) =>
      !!v.checklist_specialty && v.checklist_specialty !== "other",
    type: "radio",
  },
  {
    key: "checklist",
    step: 3,
    required: true,
    type: "file",
    slot: "checklist",
    when: "checklist_method=upload",
  },

  { key: "ref1_client", step: 4, required: true },
  { key: "ref1_name", step: 4, required: true },
  { key: "ref1_title", step: 4, required: true },
  { key: "ref1_contact", step: 4, required: true, type: "contact" },
  { key: "ref2_client", step: 4, required: true },
  { key: "ref2_name", step: 4, required: true },
  { key: "ref2_title", step: 4, required: true },
  { key: "ref2_contact", step: 4, required: true, type: "contact" },

  {
    key: "license",
    step: 5,
    required: true,
    type: "file",
    slot: "license",
  },
  {
    key: "lifesupport",
    step: 5,
    required: true,
    type: "file",
    slot: "lifesupport",
  },
  { key: "consent", step: 5, required: true, type: "consent" },
  { key: "signature", step: 5, required: true },
];

function labelFor(key: string): string {
  return LABELS[key] || "this field";
}

function requiredMessage(rule: Rule): string {
  const label = labelFor(rule.key);
  if (rule.type === "select" || rule.type === "radio" || rule.type === "emr") {
    return `Please choose your ${label}. Tip: pick one of the options shown.`;
  }
  if (rule.type === "file") {
    return `Please upload your ${label}. Tip: PDF, JPG, PNG, or HEIC up to ${FORM_CONFIG.maxFileMB} MB.`;
  }
  if (rule.type === "consent") {
    return "Please tick the consent box to continue. Tip: you must agree before submitting.";
  }
  return `Please enter your ${label}. Tip: this field is required to continue.`;
}

function fieldHasValue(
  rule: Rule,
  values: FormValues,
  files: FileStore,
): boolean {
  if (rule.type === "file" && rule.slot) {
    return (files[rule.slot]?.length ?? 0) > 0;
  }
  if (rule.type === "emr") return values.emr.length > 0;
  if (rule.type === "consent") return !!values.consent;
  const raw = (values as Record<string, unknown>)[rule.key];
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "string") return raw.trim().length > 0;
  return raw != null && raw !== "";
}

function validateValue(
  rule: Rule,
  values: FormValues,
  files: FileStore,
): string {
  if (rule.when && !isVisible(rule.when, values)) return "";
  if (rule.key === "prior_client" && !values.client) return "";
  if (
    rule.key === "prior_client_details" &&
    (!values.client || values.prior_client !== "Yes")
  )
    return "";

  const required =
    typeof rule.required === "function" ? rule.required(values) : !!rule.required;

  if (rule.type === "file" && rule.slot) {
    const n = files[rule.slot]?.length ?? 0;
    return required && !n ? requiredMessage(rule) : "";
  }

  if (rule.type === "emr") {
    return required && values.emr.length === 0 ? requiredMessage(rule) : "";
  }

  if (rule.type === "consent") {
    return required && !values.consent ? requiredMessage(rule) : "";
  }

  if (rule.type === "radio") {
    const v = (values as Record<string, unknown>)[rule.key];
    return required && !v ? requiredMessage(rule) : "";
  }

  const raw = (values as Record<string, unknown>)[rule.key];
  const v = typeof raw === "string" ? raw.trim() : "";

  if (!v) {
    if (!required) return "";
    return requiredMessage(rule);
  }

  switch (rule.type) {
    case "email":
      if (!RX_EMAIL.test(v)) {
        return "That email doesn’t look right. Tip: use a format like name@example.com.";
      }
      break;
    case "phone": {
      let d = digits(v);
      if (d.length === 11 && d.charAt(0) === "1") d = d.slice(1);
      if (d.length !== 10) {
        return "That phone number doesn’t look right. Tip: enter a 10-digit US number, like (312) 555-0199.";
      }
      break;
    }
    case "zip":
      if (!/^\d{5}(-\d{4})?$/.test(v)) {
        return "That ZIP code doesn’t look right. Tip: use 5 digits (60601) or ZIP+4 (60601-1234).";
      }
      break;
    case "ssn4":
      if (!/^\d{4}$/.test(v)) {
        return "That SSN entry doesn’t look right. Tip: enter only the last 4 digits, like 1234.";
      }
      break;
    case "dob": {
      const dt = new Date(`${v}T00:00:00`);
      if (Number.isNaN(dt.getTime())) {
        return "That date of birth doesn’t look right. Tip: pick a valid date from the calendar.";
      }
      const now = new Date();
      let age = now.getFullYear() - dt.getFullYear();
      const m = now.getMonth() - dt.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dt.getDate())) age--;
      if (age < 18) {
        return "You must be at least 18 years old. Tip: check the year — applicants under 18 can’t continue.";
      }
      if (age > 100) {
        return "That year of birth looks unlikely. Tip: double-check the year and try again.";
      }
      break;
    }
    case "futuredate": {
      const sd = new Date(`${v}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(sd.getTime()) || sd < today) {
        return "That start date isn’t available. Tip: choose today or a future date.";
      }
      break;
    }
    case "year": {
      const y = parseInt(v, 10);
      const maxYear = new Date().getFullYear() + 6;
      if (Number.isNaN(y) || y < 1950 || y > maxYear) {
        return `That year doesn’t look right. Tip: enter a 4-digit year between 1950 and ${maxYear}.`;
      }
      break;
    }
    case "contact":
      if (!RX_EMAIL.test(v) && digits(v).length < 10) {
        return "That contact doesn’t look right. Tip: enter a phone like (312) 555-0199 or an email like name@example.com.";
      }
      break;
  }
  return "";
}

export function validateStep(
  step: number,
  values: FormValues,
  files: FileStore,
): FieldErrors {
  const errors: FieldErrors = {};
  for (const rule of RULES) {
    if (rule.step !== step) continue;
    const msg = validateValue(rule, values, files);
    if (msg) errors[rule.key] = msg;
  }
  return errors;
}

/**
 * Live errors for the current step:
 * - Always show when a field is filled but wrong (format / value issues)
 * - Show missing required fields only after the field was touched
 */
export function getLiveStepErrors(
  step: number,
  values: FormValues,
  files: FileStore,
  touched: Record<string, boolean>,
): FieldErrors {
  const errors: FieldErrors = {};
  for (const rule of RULES) {
    if (rule.step !== step) continue;
    if (rule.when && !isVisible(rule.when, values)) continue;
    const msg = validateValue(rule, values, files);
    if (!msg) continue;

    const filled = fieldHasValue(rule, values, files);
    if (filled || touched[rule.key]) {
      errors[rule.key] = msg;
    }
  }
  return errors;
}

/** True when every required field on this step is filled and valid. */
export function isStepComplete(
  step: number,
  values: FormValues,
  files: FileStore,
): boolean {
  return Object.keys(validateStep(step, values, files)).length === 0;
}

export function validateAll(
  values: FormValues,
  files: FileStore,
): { step: number; errors: FieldErrors } | null {
  for (let step = 0; step <= 5; step++) {
    const errors = validateStep(step, values, files);
    if (Object.keys(errors).length) return { step, errors };
  }
  return null;
}

export function validateFile(file: File): string | null {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const allowed = ["pdf", "jpg", "jpeg", "png", "heic", "doc", "docx"];
  if (!allowed.includes(ext)) {
    return `${file.name}: unsupported file type. Tip: use PDF, JPG, PNG, HEIC, DOC, or DOCX.`;
  }
  const max = FORM_CONFIG.maxFileMB * 1024 * 1024;
  if (file.size > max) {
    return `${file.name} is over ${FORM_CONFIG.maxFileMB} MB. Tip: compress the file or upload a clearer smaller scan.`;
  }
  if (file.size === 0) {
    return `${file.name} is empty. Tip: choose a different file and try again.`;
  }
  return null;
}
