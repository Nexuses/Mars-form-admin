import type { FileSlot } from "./config";

export type FormValues = {
  company_website: string;
  client: string;
  form_version: string;
  full_name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  phone_alt: string;
  email: string;
  email_alt: string;
  dob: string;
  ssn_last4: string;
  work_auth: string;
  vehicle: string;
  background_ok: string;
  flu_shot: string;
  start_asap: string;
  start_date: string;
  days_off: string;
  days_off_details: string;
  other_offers: string;
  other_offers_details: string;
  interview_availability: string;
  profession: string;
  specialty: string;
  license_states: string;
  education_level: string;
  education_field: string;
  education_school: string;
  education_year: string;
  edu_docs: string;
  emr: string[];
  emr_other: string;
  prior_client: string;
  prior_client_details: string;
  checklist_specialty: string;
  checklist_method: string;
  ref1_client: string;
  ref1_name: string;
  ref1_title: string;
  ref1_contact: string;
  ref2_client: string;
  ref2_name: string;
  ref2_title: string;
  ref2_contact: string;
  consent: boolean;
  signature: string;
  signature_date: string;
};

export type FileStore = Record<FileSlot, File[]>;

export type FieldErrors = Record<string, string>;

export const INITIAL_VALUES: FormValues = {
  company_website: "",
  client: "",
  form_version: "1.0",
  full_name: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
  phone_alt: "",
  email: "",
  email_alt: "",
  dob: "",
  ssn_last4: "",
  work_auth: "",
  vehicle: "",
  background_ok: "",
  flu_shot: "",
  start_asap: "",
  start_date: "",
  days_off: "",
  days_off_details: "",
  other_offers: "",
  other_offers_details: "",
  interview_availability: "",
  profession: "",
  specialty: "",
  license_states: "",
  education_level: "",
  education_field: "",
  education_school: "",
  education_year: "",
  edu_docs: "",
  emr: [],
  emr_other: "",
  prior_client: "",
  prior_client_details: "",
  checklist_specialty: "",
  checklist_method: "",
  ref1_client: "",
  ref1_name: "",
  ref1_title: "",
  ref1_contact: "",
  ref2_client: "",
  ref2_name: "",
  ref2_title: "",
  ref2_contact: "",
  consent: false,
  signature: "",
  signature_date: "",
};

export const EMPTY_FILES: FileStore = {
  checklist: [],
  license: [],
  lifesupport: [],
  resume: [],
};
