"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FORM_CONFIG, STEP_TITLES } from "@/lib/application/config";
import { todaySignatureDate } from "@/lib/application/format";
import {
  EMPTY_FILES,
  INITIAL_VALUES,
  type FieldErrors,
  type FileStore,
  type FormValues,
} from "@/lib/application/types";
import { validateAll, validateStep } from "@/lib/application/validation";
import { Hero } from "./Hero";
import { ProgressRail } from "./ProgressRail";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { StepChecklist } from "./steps/StepChecklist";
import { StepDetails } from "./steps/StepDetails";
import { StepDocuments } from "./steps/StepDocuments";
import { StepEligibility } from "./steps/StepEligibility";
import { StepExperience } from "./steps/StepExperience";
import { StepReferences } from "./steps/StepReferences";

const LAST = STEP_TITLES.length - 1;

export function ApplicationForm() {
  const searchParams = useSearchParams();
  const [values, setValues] = useState<FormValues>(() => ({
    ...INITIAL_VALUES,
    form_version: FORM_CONFIG.formVersion,
    signature_date: todaySignatureDate(),
  }));
  const [files, setFiles] = useState<FileStore>(EMPTY_FILES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [step, setStep] = useState(0);
  const [stepAlert, setStepAlert] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const dirty = useRef(false);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const client = (searchParams.get("client") || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);
    if (client) {
      setValues((v) => ({ ...v, client }));
    }
  }, [searchParams]);

  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty.current && !submitted) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [submitted]);

  function markDirty() {
    dirty.current = true;
  }

  function onChange<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    markDirty();
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
    setStepAlert("");
  }

  function onEmrToggle(value: string, checked: boolean) {
    markDirty();
    setValues((prev) => {
      let emr = [...prev.emr];
      if (checked) {
        if (value === "None") emr = ["None"];
        else emr = [...emr.filter((x) => x !== "None" && x !== value), value];
      } else {
        emr = emr.filter((x) => x !== value);
      }
      return { ...prev, emr };
    });
    setErrors((prev) => {
      if (!prev.emr && !prev.emr_other) return prev;
      const next = { ...prev };
      delete next.emr;
      delete next.emr_other;
      return next;
    });
  }

  function onFiles(
    slot: keyof FileStore,
    next: File[],
    message?: string,
  ) {
    markDirty();
    setFiles((prev) => ({ ...prev, [slot]: next }));
    setErrors((prev) => {
      const copy = { ...prev };
      if (message) copy[slot] = message;
      else delete copy[slot];
      return copy;
    });
  }

  function go(i: number, focus = true) {
    setStep(i);
    setStepAlert("");
    setSubmitError("");
    if (focus) {
      requestAnimationFrame(() => {
        const h = document.querySelector<HTMLElement>(
          `.step[aria-labelledby="h-${i + 1}"] h2`,
        );
        h?.focus({ preventScroll: true });
        document.getElementById("form-top")?.scrollIntoView({ block: "start" });
      });
    }
  }

  function runValidate(i: number): boolean {
    const errs = validateStep(i, values, files);
    setErrors(errs);
    const count = Object.keys(errs).length;
    if (count) {
      setStepAlert(
        count === 1
          ? "One answer needs your attention before you continue."
          : `${count} answers need your attention before you continue.`,
      );
      const firstKey = Object.keys(errs)[0];
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>(
          `[name="${firstKey}"], #${firstKey}, #file-${firstKey}`,
        );
        el?.focus();
        el?.closest(".field")?.scrollIntoView({ block: "center" });
      });
      return false;
    }
    setStepAlert("");
    return true;
  }

  function jump(i: number) {
    if (i <= step) {
      go(i);
      return;
    }
    for (let k = step; k < i; k++) {
      const errs = validateStep(k, values, files);
      if (Object.keys(errs).length) {
        go(k, true);
        setErrors(errs);
        const count = Object.keys(errs).length;
        setStepAlert(
          count === 1
            ? "One answer needs your attention before you continue."
            : `${count} answers need your attention before you continue.`,
        );
        return;
      }
    }
    go(i);
  }

  async function submitForm() {
    if (submitting) return;
    const fail = validateAll(values, files);
    if (fail) {
      go(fail.step, true);
      setErrors(fail.errors);
      const count = Object.keys(fail.errors).length;
      setStepAlert(
        count === 1
          ? "One answer needs your attention before you continue."
          : `${count} answers need your attention before you continue.`,
      );
      return;
    }

    if (values.company_website) {
      setSubmitted(true);
      return;
    }

    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      if (k === "company_website") return;
      if (k === "emr") {
        (v as string[]).forEach((item) => fd.append("emr", item));
        return;
      }
      if (k === "consent") {
        if (v) fd.append("consent", "Yes");
        return;
      }
      if (typeof v === "string") fd.append(k, v);
    });

    (["checklist", "license", "lifesupport", "resume"] as const).forEach(
      (slot) => {
        if (slot === "checklist" && values.checklist_method !== "upload") return;
        files[slot].forEach((f) => fd.append(slot, f, f.name));
      },
    );
    fd.append("submitted_at", new Date().toISOString());
    fd.append("page_url", window.location.origin + window.location.pathname);

    setSubmitting(true);
    setSubmitError("");
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 120000);
      const res = await fetch("/api/apply", {
        method: "POST",
        body: fd,
        signal: ctrl.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json().catch(() => ({}))) as {
        reference?: string;
        id?: string;
      };
      setReference(data.reference || data.id || "");
      dirty.current = false;
      setSubmitted(true);
      requestAnimationFrame(() => {
        document.getElementById("success-title")?.focus({ preventScroll: true });
        document.getElementById("form-top")?.scrollIntoView({ block: "start" });
      });
    } catch (err) {
      console.error("MARS form submit failed:", err);
      setSubmitError(
        "We could not send your application. Check your connection and try again. Your answers are still on this page. If it keeps happening, contact your MARS recruiter.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < LAST) {
      if (runValidate(step)) go(step + 1);
    } else {
      void submitForm();
    }
  }

  const firstName = values.full_name.trim().split(/\s+/)[0];

  return (
    <>
      <a className="skip" href="#form-top">
        Skip to the application form
      </a>
      <SiteHeader />
      <Hero />
      <main className="shell" id="main">
        <ProgressRail
          current={step}
          complete={submitted}
          onJump={(i) => {
            if (!submitted) jump(i);
          }}
        />
        <div className="card" id="form-top" ref={headingRef}>
          {submitted ? (
            <div className="success" id="success">
              <div className="success-icon" aria-hidden="true">
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </div>
              <h2 id="success-title" tabIndex={-1}>
                Application received
              </h2>
              <p id="success-text">
                {firstName
                  ? `Thank you, ${firstName}. A MARS recruiter will review your details and be in touch.`
                  : "Thank you. A MARS recruiter will review your details and be in touch."}
              </p>
              <p>
                Keep your phone and email handy. If anything changes, reply to
                the message you received from your recruiter.
              </p>
              {reference ? (
                <span className="ref" id="success-ref">
                  Reference: {reference}
                </span>
              ) : null}
            </div>
          ) : (
            <form id="app" noValidate autoComplete="on" onSubmit={onSubmit}>
              <div className="hp" aria-hidden="true">
                <label>
                  Leave this field empty{" "}
                  <input
                    type="text"
                    name="company_website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={values.company_website}
                    onChange={(e) =>
                      onChange("company_website", e.target.value)
                    }
                  />
                </label>
              </div>

              {step === 0 ? (
                <StepDetails
                  values={values}
                  errors={errors}
                  onChange={onChange}
                />
              ) : null}
              {step === 1 ? (
                <StepEligibility
                  values={values}
                  errors={errors}
                  onChange={onChange}
                />
              ) : null}
              {step === 2 ? (
                <StepExperience
                  values={values}
                  errors={errors}
                  onChange={onChange}
                  onEmrToggle={onEmrToggle}
                />
              ) : null}
              {step === 3 ? (
                <StepChecklist
                  values={values}
                  errors={errors}
                  files={files}
                  onChange={onChange}
                  onFiles={onFiles}
                />
              ) : null}
              {step === 4 ? (
                <StepReferences
                  values={values}
                  errors={errors}
                  onChange={onChange}
                />
              ) : null}
              {step === 5 ? (
                <StepDocuments
                  values={values}
                  errors={errors}
                  files={files}
                  submitError={submitError}
                  onChange={onChange}
                  onFiles={onFiles}
                  onEdit={(i) => go(i)}
                />
              ) : null}

              {stepAlert ? (
                <div className="note alert step-alert" id="step-alert" role="alert">
                  <p>{stepAlert}</p>
                </div>
              ) : null}

              <div className="actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  id="btn-back"
                  hidden={step === 0}
                  disabled={submitting}
                  onClick={() => {
                    if (step > 0) go(step - 1);
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  id="btn-next"
                  style={{ marginLeft: "auto" }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner" />
                      Submitting
                    </>
                  ) : step === LAST ? (
                    "Submit application"
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
