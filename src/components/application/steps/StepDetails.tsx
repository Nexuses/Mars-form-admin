"use client";

import { US_STATES } from "@/lib/application/states";
import {
  adultDobMax,
  digits,
  formatPhone,
} from "@/lib/application/format";
import type { FieldErrors, FormValues } from "@/lib/application/types";
import { FieldWrap, OptionalHint, ReqMark } from "../ui";
import { useState } from "react";

export function StepDetails({
  values,
  errors,
  onChange,
}: {
  values: FormValues;
  errors: FieldErrors;
  onChange: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void;
}) {
  const [showSsn, setShowSsn] = useState(false);

  return (
    <section className="step" aria-labelledby="h-1">
      <h2 id="h-1" tabIndex={-1}>
        Your details
      </h2>
      <p className="step-lead">
        Use your legal name and permanent address, exactly as they appear on
        your license or government ID.
      </p>

      <div className="note">
        <details>
          <summary>What to have ready</summary>
          <ul>
            <li>Your professional license and any certificates (PDF or a clear photo)</li>
            <li>Your current life-support card, such as BLS or ACLS</li>
            <li>Two professional references from the last 2 to 5 years</li>
            <li>The skills checklist for your specialty (we link to it in step 4)</li>
          </ul>
        </details>
      </div>

      <div className="grid">
        <FieldWrap error={errors.full_name} className="span-2">
          <label htmlFor="full_name">
            Full legal name
            <ReqMark />
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            autoComplete="name"
            maxLength={120}
            aria-required
            value={values.full_name}
            onChange={(e) => onChange("full_name", e.target.value)}
          />
        </FieldWrap>

        <FieldWrap error={errors.address_line1} className="span-2">
          <label htmlFor="address_line1">
            Permanent home address
            <ReqMark />
          </label>
          <input
            type="text"
            id="address_line1"
            name="address_line1"
            autoComplete="address-line1"
            maxLength={150}
            placeholder="Street address"
            aria-required
            value={values.address_line1}
            onChange={(e) => onChange("address_line1", e.target.value)}
          />
        </FieldWrap>

        <FieldWrap className="span-2">
          <label htmlFor="address_line2">
            Apartment, suite or unit
            <OptionalHint />
          </label>
          <input
            type="text"
            id="address_line2"
            name="address_line2"
            autoComplete="address-line2"
            maxLength={80}
            value={values.address_line2}
            onChange={(e) => onChange("address_line2", e.target.value)}
          />
        </FieldWrap>

        <div className="addr-row">
          <FieldWrap error={errors.city}>
            <label htmlFor="city">
              City
              <ReqMark />
            </label>
            <input
              type="text"
              id="city"
              name="city"
              autoComplete="address-level2"
              maxLength={80}
              aria-required
              value={values.city}
              onChange={(e) => onChange("city", e.target.value)}
            />
          </FieldWrap>
          <FieldWrap error={errors.state}>
            <label htmlFor="state">
              State
              <ReqMark />
            </label>
            <select
              id="state"
              name="state"
              autoComplete="address-level1"
              aria-required
              value={values.state}
              onChange={(e) => onChange("state", e.target.value)}
            >
              <option value="">Select state</option>
              {US_STATES.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </FieldWrap>
          <FieldWrap error={errors.zip}>
            <label htmlFor="zip">
              ZIP code
              <ReqMark />
            </label>
            <input
              type="text"
              id="zip"
              name="zip"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={10}
              aria-required
              value={values.zip}
              onChange={(e) =>
                onChange("zip", e.target.value.replace(/[^\d-]/g, "").slice(0, 10))
              }
            />
          </FieldWrap>
        </div>

        <FieldWrap error={errors.phone}>
          <label htmlFor="phone">
            Phone number
            <ReqMark />
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(555) 123-4567"
            aria-required
            value={values.phone}
            onChange={(e) => onChange("phone", formatPhone(e.target.value))}
          />
        </FieldWrap>

        <FieldWrap error={errors.phone_alt}>
          <label htmlFor="phone_alt">
            Alternate phone
            <OptionalHint />
          </label>
          <input
            type="tel"
            id="phone_alt"
            name="phone_alt"
            inputMode="tel"
            autoComplete="off"
            placeholder="(555) 123-4567"
            value={values.phone_alt}
            onChange={(e) => onChange("phone_alt", formatPhone(e.target.value))}
          />
        </FieldWrap>

        <FieldWrap error={errors.email}>
          <label htmlFor="email">
            Email address
            <ReqMark />
          </label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            maxLength={160}
            aria-required
            value={values.email}
            onChange={(e) => onChange("email", e.target.value)}
          />
        </FieldWrap>

        <FieldWrap error={errors.email_alt}>
          <label htmlFor="email_alt">
            Alternate email
            <OptionalHint />
          </label>
          <input
            type="email"
            id="email_alt"
            name="email_alt"
            autoComplete="off"
            maxLength={160}
            value={values.email_alt}
            onChange={(e) => onChange("email_alt", e.target.value)}
          />
        </FieldWrap>

        <FieldWrap error={errors.dob}>
          <label htmlFor="dob">
            Date of birth
            <ReqMark />
          </label>
          <input
            type="date"
            id="dob"
            name="dob"
            autoComplete="bday"
            min="1920-01-01"
            max={adultDobMax()}
            aria-required
            value={values.dob}
            onChange={(e) => onChange("dob", e.target.value)}
          />
        </FieldWrap>

        <FieldWrap error={errors.ssn_last4}>
          <label htmlFor="ssn_last4">
            Last 4 digits of SSN
            <ReqMark />
          </label>
          <div className="with-toggle">
            <input
              type={showSsn ? "text" : "password"}
              id="ssn_last4"
              name="ssn_last4"
              inputMode="numeric"
              maxLength={4}
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore
              aria-required
              value={values.ssn_last4}
              onChange={(e) =>
                onChange("ssn_last4", digits(e.target.value).slice(0, 4))
              }
            />
            <button
              type="button"
              className="toggle-btn"
              aria-controls="ssn_last4"
              aria-pressed={showSsn}
              onClick={() => setShowSsn((s) => !s)}
            >
              {showSsn ? "Hide" : "Show"}
            </button>
          </div>
          <p className="hint" style={{ margin: "6px 0 0" }}>
            Last 4 digits only. We do not ask for your full number here.
          </p>
        </FieldWrap>
      </div>
    </section>
  );
}
