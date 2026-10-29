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
    return required && !n ? "Upload at least one file." : "";
  }

  if (rule.type === "emr") {
    return required && values.emr.length === 0
      ? "Select at least one option."
      : "";
  }

  if (rule.type === "consent") {
    return required && !values.consent
      ? "Please tick this box to continue."
      : "";
  }

  if (rule.type === "radio") {
    const v = (values as Record<string, unknown>)[rule.key];
    return required && !v ? "Choose an option." : "";
  }

  const raw = (values as Record<string, unknown>)[rule.key];
  const v = typeof raw === "string" ? raw.trim() : "";

  if (!v) {
    if (!required) return "";
    return rule.type === "select" ? "Choose an option." : "This field is required.";
  }

  switch (rule.type) {
    case "email":
      if (!RX_EMAIL.test(v))
        return "Enter a valid email address, like name@example.com.";
      break;
    case "phone": {
      let d = digits(v);
      if (d.length === 11 && d.charAt(0) === "1") d = d.slice(1);
      if (d.length !== 10) return "Enter a 10-digit US phone number.";
      break;
    }
    case "zip":
      if (!/^\d{5}(-\d{4})?$/.test(v)) return "Enter a 5-digit ZIP code.";
      break;
    case "ssn4":
      if (!/^\d{4}$/.test(v)) return "Enter exactly 4 digits.";
      break;
    case "dob": {
      const dt = new Date(`${v}T00:00:00`);
      if (Number.isNaN(dt.getTime())) return "Enter a valid date of birth.";
      const now = new Date();
      let age = now.getFullYear() - dt.getFullYear();
      const m = now.getMonth() - dt.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dt.getDate())) age--;
      if (age < 18) return "You must be at least 18 years old.";
      if (age > 100) return "Check the year of birth.";
      break;
    }
    case "futuredate": {
      const sd = new Date(`${v}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(sd.getTime()) || sd < today)
        return "Choose today or a future date.";
      break;
    }
    case "year": {
      const y = parseInt(v, 10);
      if (Number.isNaN(y) || y < 1950 || y > new Date().getFullYear() + 6)
        return "Enter a valid 4-digit year.";
      break;
    }
    case "contact":
      if (!RX_EMAIL.test(v) && digits(v).length < 10)
        return "Enter a phone number or email address.";
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
  if (!allowed.includes(ext)) return `${file.name}: unsupported file type.`;
  const max = FORM_CONFIG.maxFileMB * 1024 * 1024;
  if (file.size > max) return `${file.name} is over ${FORM_CONFIG.maxFileMB} MB.`;
  if (file.size === 0) return `${file.name} is empty.`;
  return null;
}
