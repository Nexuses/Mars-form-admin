"use client";

import {
  EDUCATION_LEVELS,
  EMR_OPTIONS,
  PROFESSIONS,
} from "@/lib/application/config";
import type { FieldErrors, FormValues } from "@/lib/application/types";
import { FieldWrap, OptionalHint, ReqMark, YesNoField } from "../ui";

export function StepExperience({
  values,
  errors,
  onChange,
  onEmrToggle,
}: {
  values: FormValues;
  errors: FieldErrors;
  onChange: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void;
  onEmrToggle: (value: string, checked: boolean) => void;
}) {
  const yearMax = new Date().getFullYear() + 6;

  return (
    <section className="step" aria-labelledby="h-3">
      <h2 id="h-3" tabIndex={-1}>
        Experience and credentials
      </h2>
      <p className="step-lead">
        Tell us about your profession, education and the systems you have worked
        with.
      </p>

      <div className="group">
        <h3>Profession</h3>
        <div className="grid">
          <FieldWrap error={errors.profession}>
            <label htmlFor="profession">
              Profession
              <ReqMark />
            </label>
            <select
              id="profession"
              name="profession"
              aria-required
              value={values.profession}
              onChange={(e) => onChange("profession", e.target.value)}
            >
              <option value="">Select your profession</option>
              {PROFESSIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </FieldWrap>
          <FieldWrap>
            <label htmlFor="specialty">
              Specialty or unit
              <OptionalHint />
            </label>
            <input
              type="text"
              id="specialty"
              name="specialty"
              maxLength={100}
              placeholder="For example: Ambulatory, ICU, Med-Surg"
              value={values.specialty}
              onChange={(e) => onChange("specialty", e.target.value)}
            />
          </FieldWrap>
          <FieldWrap className="span-2">
            <label htmlFor="license_states">
              State(s) where you hold an active license
              <OptionalHint />
            </label>
            <input
              type="text"
              id="license_states"
              name="license_states"
              maxLength={120}
              placeholder="For example: WI, IL"
              value={values.license_states}
              onChange={(e) => onChange("license_states", e.target.value)}
            />
          </FieldWrap>
        </div>
      </div>

      <div className="group">
        <h3>Education</h3>
        <div className="grid">
          <FieldWrap error={errors.education_level}>
            <label htmlFor="education_level">
              Highest level completed
              <ReqMark />
            </label>
            <select
              id="education_level"
              name="education_level"
              aria-required
              value={values.education_level}
              onChange={(e) => onChange("education_level", e.target.value)}
            >
              <option value="">Select level</option>
              {EDUCATION_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </FieldWrap>
          <FieldWrap error={errors.education_field}>
            <label htmlFor="education_field">
              Degree or program
              <ReqMark />
            </label>
            <input
              type="text"
              id="education_field"
              name="education_field"
              maxLength={120}
              placeholder="For example: BSN, Nursing"
              aria-required
              value={values.education_field}
              onChange={(e) => onChange("education_field", e.target.value)}
            />
          </FieldWrap>
          <FieldWrap error={errors.education_school}>
            <label htmlFor="education_school">
              School or institution
              <ReqMark />
            </label>
            <input
              type="text"
              id="education_school"
              name="education_school"
              maxLength={140}
              aria-required
              value={values.education_school}
              onChange={(e) => onChange("education_school", e.target.value)}
            />
          </FieldWrap>
          <FieldWrap error={errors.education_year}>
            <label htmlFor="education_year">
              Year completed
              <OptionalHint />
            </label>
            <input
              type="number"
              id="education_year"
              name="education_year"
              inputMode="numeric"
              min={1950}
              max={yearMax}
              value={values.education_year}
              onChange={(e) => onChange("education_year", e.target.value)}
            />
          </FieldWrap>
          <div className="span-2">
            <YesNoField
              name="edu_docs"
              label="Do you have your educational documents available if we need them?"
              value={values.edu_docs}
              error={errors.edu_docs}
              onChange={(v) => onChange("edu_docs", v)}
            />
          </div>
        </div>
      </div>

      <div className="group">
        <h3>EMR and EHR experience</h3>
        <fieldset className={`field${errors.emr ? " invalid" : ""}`}>
          <p className="label" id="emr-label" style={{ marginBottom: 8 }}>
            Which systems have you used in a clinical role?
            <ReqMark />
          </p>
          <div className="choices" role="group" aria-labelledby="emr-label">
            {EMR_OPTIONS.map((opt) => (
              <label className="choice" key={opt}>
                <input
                  type="checkbox"
                  name="emr"
                  value={opt}
                  checked={values.emr.includes(opt)}
                  onChange={(e) => onEmrToggle(opt, e.target.checked)}
                />
                <span>{opt === "Other" ? "Other system" : opt}</span>
              </label>
            ))}
          </div>
          {errors.emr ? (
            <p className="err" aria-live="polite">
              {errors.emr}
            </p>
          ) : null}
        </fieldset>
        {values.emr.includes("Other") ? (
          <div className="cond">
            <FieldWrap error={errors.emr_other}>
              <label htmlFor="emr_other">
                Which other system?
                <ReqMark />
              </label>
              <input
                type="text"
                id="emr_other"
                name="emr_other"
                maxLength={120}
                aria-required
                value={values.emr_other}
                onChange={(e) => onChange("emr_other", e.target.value)}
              />
            </FieldWrap>
          </div>
        ) : null}
      </div>

      {values.client ? (
        <div className="group" id="client-block">
          <h3>
            Questions for <span className="client-name">{values.client}</span>
          </h3>
          <div className="stack">
            <div>
              <fieldset
                className={`field${errors.prior_client ? " invalid" : ""}`}
              >
                <legend>
                  Have you ever worked with{" "}
                  <span className="client-name">{values.client}</span>?
                  <ReqMark />
                </legend>
                <div className="choices">
                  {(["Yes", "No"] as const).map((opt) => (
                    <label className="choice" key={opt}>
                      <input
                        type="radio"
                        name="prior_client"
                        value={opt}
                        checked={values.prior_client === opt}
                        onChange={() => onChange("prior_client", opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                {errors.prior_client ? (
                  <p className="err" aria-live="polite">
                    {errors.prior_client}
                  </p>
                ) : null}
              </fieldset>
              {values.prior_client === "Yes" ? (
                <div className="cond">
                  <FieldWrap error={errors.prior_client_details}>
                    <label htmlFor="prior_client_details">
                      List your dates and type of employment
                      <ReqMark />
                    </label>
                    <p className="hint">
                      For example: 2022, full-time, or 2023 to 2024, contingent
                      or SOW.
                    </p>
                    <textarea
                      id="prior_client_details"
                      name="prior_client_details"
                      maxLength={600}
                      aria-required
                      value={values.prior_client_details}
                      onChange={(e) =>
                        onChange("prior_client_details", e.target.value)
                      }
                    />
                  </FieldWrap>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
