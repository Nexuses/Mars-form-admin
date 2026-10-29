"use client";

import { isoDate } from "@/lib/application/format";
import type { FieldErrors, FormValues } from "@/lib/application/types";
import { FieldWrap, ReqMark, YesNoField } from "../ui";

export function StepEligibility({
  values,
  errors,
  onChange,
}: {
  values: FormValues;
  errors: FieldErrors;
  onChange: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void;
}) {
  const today = isoDate(new Date());

  return (
    <section className="step" aria-labelledby="h-2">
      <h2 id="h-2" tabIndex={-1}>
        Eligibility and availability
      </h2>
      <p className="step-lead">
        A few quick questions about work authorization, screening and when you
        can start.
      </p>

      <div className="stack">
        <YesNoField
          name="work_auth"
          label="Are you legally authorized to work in the US for any employer?"
          value={values.work_auth}
          error={errors.work_auth}
          onChange={(v) => onChange("work_auth", v)}
        />
        <YesNoField
          name="vehicle"
          label="Do you have your own vehicle?"
          value={values.vehicle}
          error={errors.vehicle}
          onChange={(v) => onChange("vehicle", v)}
        />
        <YesNoField
          name="background_ok"
          label="Are you comfortable with a background check and drug test?"
          value={values.background_ok}
          error={errors.background_ok}
          onChange={(v) => onChange("background_ok", v)}
        />
        <YesNoField
          name="flu_shot"
          label="Have you had a flu shot this season?"
          value={values.flu_shot}
          error={errors.flu_shot}
          onChange={(v) => onChange("flu_shot", v)}
        />

        <div>
          <YesNoField
            name="start_asap"
            label="Are you open to starting as soon as possible?"
            value={values.start_asap}
            error={errors.start_asap}
            onChange={(v) => onChange("start_asap", v)}
          />
          {values.start_asap === "No" ? (
            <div className="cond">
              <FieldWrap error={errors.start_date}>
                <label htmlFor="start_date">
                  Earliest date you can start
                  <ReqMark />
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  min={today}
                  aria-required
                  value={values.start_date}
                  onChange={(e) => onChange("start_date", e.target.value)}
                />
              </FieldWrap>
            </div>
          ) : null}
        </div>

        <div>
          <YesNoField
            name="days_off"
            label="Do you have any holidays or days off planned in the first 13 weeks after your start date?"
            value={values.days_off}
            error={errors.days_off}
            onChange={(v) => onChange("days_off", v)}
          />
          {values.days_off === "Yes" ? (
            <div className="cond">
              <FieldWrap error={errors.days_off_details}>
                <label htmlFor="days_off_details">
                  Which dates?
                  <ReqMark />
                </label>
                <textarea
                  id="days_off_details"
                  name="days_off_details"
                  maxLength={600}
                  placeholder="For example: Nov 24 to Nov 28, Dec 24 to Dec 26"
                  aria-required
                  value={values.days_off_details}
                  onChange={(e) => onChange("days_off_details", e.target.value)}
                />
              </FieldWrap>
            </div>
          ) : null}
        </div>

        <div>
          <YesNoField
            name="other_offers"
            label="Do you have any offers or interviews with another client or employer right now?"
            value={values.other_offers}
            error={errors.other_offers}
            onChange={(v) => onChange("other_offers", v)}
          />
          {values.other_offers === "Yes" ? (
            <div className="cond">
              <FieldWrap error={errors.other_offers_details}>
                <label htmlFor="other_offers_details">
                  Tell us a little about them
                  <ReqMark />
                </label>
                <textarea
                  id="other_offers_details"
                  name="other_offers_details"
                  maxLength={600}
                  placeholder="Employer or client, stage, and any decision dates"
                  aria-required
                  value={values.other_offers_details}
                  onChange={(e) =>
                    onChange("other_offers_details", e.target.value)
                  }
                />
              </FieldWrap>
            </div>
          ) : null}
        </div>

        <FieldWrap error={errors.interview_availability}>
          <label htmlFor="interview_availability">
            When are you available for an interview?
            <ReqMark />
          </label>
          <p className="hint">Include days, times and your time zone.</p>
          <textarea
            id="interview_availability"
            name="interview_availability"
            maxLength={600}
            placeholder="For example: Weekdays after 2 pm Central, or any morning this week"
            aria-required
            value={values.interview_availability}
            onChange={(e) => onChange("interview_availability", e.target.value)}
          />
        </FieldWrap>
      </div>
    </section>
  );
}
