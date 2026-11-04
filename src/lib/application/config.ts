import { CHECKLISTS } from "./checklists";

/**
 * A checklist either links out to an external page (`url`) or opens a MARS
 * checklist bundled under `public/checklists` (`page`).
 */
export type ChecklistItem = {
  group: string;
  label: string;
  url?: string;
  page?: string;
};

export type ExtraQuestion = {
  name: string;
  label: string;
  type: "yesno" | "text" | "textarea";
  required?: boolean;
};

export const FORM_CONFIG = {
  /** Used unless the link carries its own ?client=. Use ?client=none to hide it. */
  clientName: "Advocate Aurora Health",
  checklists: CHECKLISTS,
  checklistPagesPath: "/checklists/",
  maxFileMB: 10,
  maxFilesPerSlot: 5,
  formVersion: "1.0",
};

export function checklistHref(item: ChecklistItem): string {
  return item.page
    ? FORM_CONFIG.checklistPagesPath + encodeURIComponent(item.page)
    : (item.url as string);
}

/** Checklist options grouped for the specialty <select>. */
export function checklistGroups(): { group: string; items: { index: number; item: ChecklistItem }[] }[] {
  const groups: { group: string; items: { index: number; item: ChecklistItem }[] }[] = [];
  CHECKLISTS.forEach((item, index) => {
    let bucket = groups.find((g) => g.group === item.group);
    if (!bucket) {
      bucket = { group: item.group, items: [] };
      groups.push(bucket);
    }
    bucket.items.push({ index, item });
  });
  return groups;
}

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
