export type ChecklistItem = { label: string; url: string };

export type ExtraQuestion = {
  name: string;
  label: string;
  type: "yesno" | "text" | "textarea";
  required?: boolean;
};

export const FORM_CONFIG = {
  checklists: [
    {
      label: "Ambulatory",
      url: "https://www.rehabilitycare.com/checklists/Ambulatory.html",
    },
  ] as ChecklistItem[],
  maxFileMB: 10,
  maxFilesPerSlot: 5,
  formVersion: "1.0",
};

export const STEP_TITLES = [
  "Your details",
  "Eligibility",
  "Experience",
  "Skills checklist",
  "References",
  "Documents and review",
] as const;

export const PROFESSIONS = [
  "Registered Nurse (RN)",
  "Licensed Practical / Vocational Nurse (LPN/LVN)",
  "Nurse Practitioner (NP)",
  "Certified Nursing Assistant (CNA)",
  "Allied health professional",
  "Behavioral health professional",
  "Other clinical role",
] as const;

export const EDUCATION_LEVELS = [
  "Certificate or diploma",
  "Associate degree",
  "Bachelor's degree",
  "Master's degree",
  "Doctoral degree",
  "Other",
] as const;

export const EMR_OPTIONS = ["Epic", "Cerner", "Meditech", "Other", "None"] as const;

export const ALLOWED_EXT = ["pdf", "jpg", "jpeg", "png", "heic", "doc", "docx"] as const;

export const FILE_SLOTS = ["checklist", "license", "lifesupport", "resume"] as const;
export type FileSlot = (typeof FILE_SLOTS)[number];
