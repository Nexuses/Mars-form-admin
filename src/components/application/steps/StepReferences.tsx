"use client";

import type { FieldErrors, FormValues } from "@/lib/application/types";
import { FieldWrap, ReqMark } from "../ui";

function RefCard({
  n,
  values,
  errors,
  onChange,
  placeholders,
}: {
  n: 1 | 2;
  values: FormValues;
  errors: FieldErrors;
  onChange: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void;
  placeholders: { title: string };
}) {
  const clientKey = `ref${n}_client` as const;
  const nameKey = `ref${n}_name` as const;
  const titleKey = `ref${n}_title` as const;
  const contactKey = `ref${n}_contact` as const;

  return (
    <div className="refcard">
      <h3>Reference {n}</h3>
      <div className="grid">
        <FieldWrap error={errors[clientKey]}>
          <label htmlFor={clientKey}>
            Client or employer
            <ReqMark />
          </label>
          <input
            type="text"
            id={clientKey}
            name={clientKey}
            maxLength={140}
            aria-required
            value={values[clientKey]}
            onChange={(e) => onChange(clientKey, e.target.value)}
          />
        </FieldWrap>
        <FieldWrap error={errors[nameKey]}>
          <label htmlFor={nameKey}>
            Name
            <ReqMark />
          </label>
          <input
            type="text"
            id={nameKey}
            name={nameKey}
            maxLength={120}
            aria-required
            value={values[nameKey]}
            onChange={(e) => onChange(nameKey, e.target.value)}
          />
        </FieldWrap>
        <FieldWrap error={errors[titleKey]}>
          <label htmlFor={titleKey}>
            Designation
            <ReqMark />
          </label>
          <input
            type="text"
            id={titleKey}
            name={titleKey}
            maxLength={120}
            placeholder={placeholders.title}
            aria-required
            value={values[titleKey]}
            onChange={(e) => onChange(titleKey, e.target.value)}
          />
        </FieldWrap>
        <FieldWrap error={errors[contactKey]}>
          <label htmlFor={contactKey}>
            Phone or email
            <ReqMark />
          </label>
          <input
            type="text"
            id={contactKey}
            name={contactKey}
            maxLength={160}
            aria-required
            value={values[contactKey]}
            onChange={(e) => onChange(contactKey, e.target.value)}
          />
        </FieldWrap>
      </div>
    </div>
  );
}

export function StepReferences({
  values,
  errors,
  onChange,
}: {
  values: FormValues;
  errors: FieldErrors;
  onChange: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void;
}) {
  return (
    <section className="step" aria-labelledby="h-5">
      <h2 id="h-5" tabIndex={-1}>
        Professional references
      </h2>
      <p className="step-lead">
        Please provide two references from the last 2 to 5 years of employment.
        Each must be a manager or supervisor you worked with directly.
      </p>

      <RefCard
        n={1}
        values={values}
        errors={errors}
        onChange={onChange}
        placeholders={{ title: "For example: Nurse Manager" }}
      />
      <RefCard
        n={2}
        values={values}
        errors={errors}
        onChange={onChange}
        placeholders={{ title: "For example: Clinical Supervisor" }}
      />
    </section>
  );
}
