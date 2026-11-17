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
import { uploadApplicationFiles } from "@/lib/application/upload-client";
import {
  getLiveStepErrors,
  isStepComplete,
  validateAll,
  validateStep,
} from "@/lib/application/validation";
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
    client: FORM_CONFIG.clientName,
    form_version: FORM_CONFIG.formVersion,
    signature_date: todaySignatureDate(),
  }));
  const [files, setFiles] = useState<FileStore>(EMPTY_FILES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [fileErrors, setFileErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState(0);
  const [stepAlert, setStepAlert] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const dirty = useRef(false);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fromLink = (searchParams.get("client") || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);
    const client =
      fromLink.toLowerCase() === "none"
        ? ""
        : fromLink || FORM_CONFIG.clientName;
    setValues((v) => ({ ...v, client }));
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
    setTouched((prev) => ({ ...prev, [key as string]: true }));
    setValues((prev) => ({ ...prev, [key]: value }));
    setStepAlert("");
  }

  function onEmrToggle(value: string, checked: boolean) {
    markDirty();
    setTouched((prev) => ({ ...prev, emr: true }));
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
  }

  function onFiles(
    slot: keyof FileStore,
    next: File[],
    message?: string,
  ) {
    markDirty();
    setTouched((prev) => ({ ...prev, [slot]: true }));
    setFiles((prev) => ({ ...prev, [slot]: next }));
    // Show reject tips only while the pick failed; clear as soon as a valid file lands.
    setFileErrors((prev) => {
      const copy = { ...prev };
      if (message) copy[slot] = message;
      else delete copy[slot];
      return copy;
    });
  }

  useEffect(() => {
    setErrors(getLiveStepErrors(step, values, files, touched));
  }, [step, values, files, touched]);

  const displayErrors: FieldErrors = { ...errors, ...fileErrors };

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
    const allTouched = { ...touched };
    Object.keys(errs).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    setErrors(errs);
    const count = Object.keys(errs).length;
    if (count) {
      const firstKey = Object.keys(errs)[0];
      const firstMsg = errs[firstKey];
      setStepAlert(
        count === 1
          ? firstMsg
          : `${count} answers need fixing before you continue. ${firstMsg}`,
      );
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

    // Honeypot: bots that fill hidden fields never reach the API.
    // Do not fake a success screen — that hid real autofill false-positives.
    if (values.company_website.trim()) {
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const attachments = await uploadApplicationFiles(
        files,
        values.checklist_method,
      );

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

      fd.append("attachments_json", JSON.stringify(attachments));
      fd.append("submitted_at", new Date().toISOString());
      fd.append("page_url", window.location.origin + window.location.pathname);

      const ctrl = new AbortController();
      // Large S3 uploads (up to 50 MB each) need a longer client timeout.
      const timer = setTimeout(() => ctrl.abort(), 300000);
      const res = await fetch("/api/apply", {
        method: "POST",
        body: fd,
        signal: ctrl.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timer);
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || `HTTP ${res.status}`);
      }
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
      const message =
        err instanceof Error && err.message && !err.message.startsWith("HTTP ")
          ? err.message
          : "We could not send your application. Check your connection and try again. Your answers are still on this page. If it keeps happening, contact your MARS recruiter.";
      setSubmitError(message);
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
  const stepReady = isStepComplete(step, values, files);
  const primaryDisabled = submitting || !stepReady;

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
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    value={values.company_website}
                    onChange={(e) =>
                      onChange("company_website", e.target.value)
                    }
                    onFocus={(e) => e.currentTarget.blur()}
                  />
                </label>
              </div>

              {step === 0 ? (
                <StepDetails
                  values={values}
                  errors={displayErrors}
                  onChange={onChange}
                />
              ) : null}
              {step === 1 ? (
                <StepEligibility
                  values={values}
                  errors={displayErrors}
                  onChange={onChange}
                />
              ) : null}
              {step === 2 ? (
                <StepExperience
                  values={values}
                  errors={displayErrors}
                  onChange={onChange}
                  onEmrToggle={onEmrToggle}
                />
              ) : null}
              {step === 3 ? (
                <StepChecklist
                  values={values}
                  errors={displayErrors}
                  files={files}
                  onChange={onChange}
                  onFiles={onFiles}
                />
              ) : null}
              {step === 4 ? (
                <StepReferences
                  values={values}
                  errors={displayErrors}
                  onChange={onChange}
                />
              ) : null}
              {step === 5 ? (
                <StepDocuments
                  values={values}
                  errors={displayErrors}
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
                  disabled={primaryDisabled}
                  aria-disabled={primaryDisabled}
                  title={
                    stepReady
                      ? undefined
                      : "Fill all required fields on this step to continue"
                  }
                >
                  {submitting ? (
                    <>
                      <span className="spinner" />
                      Uploading & submitting
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
