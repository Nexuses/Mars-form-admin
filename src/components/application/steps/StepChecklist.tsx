"use client";

import { useState } from "react";
import {
  FORM_CONFIG,
  checklistGroups,
  checklistHref,
} from "@/lib/application/config";
import type { FieldErrors, FileStore, FormValues } from "@/lib/application/types";
import { ChecklistViewer } from "../ChecklistViewer";
import { ErrorText, FieldWrap, FileDrop, ReqMark } from "../ui";

export function StepChecklist({
  values,
  errors,
  files,
  onChange,
  onFiles,
}: {
  values: FormValues;
  errors: FieldErrors;
  files: FileStore;
  onChange: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void;
  onFiles: (slot: "checklist", next: File[], message?: string) => void;
}) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const v = values.checklist_specialty;
  const isListed = v !== "" && v !== "other";
  const checklist =
    isListed && FORM_CONFIG.checklists[Number(v)]
      ? FORM_CONFIG.checklists[Number(v)]
      : null;
  const isEmbedded = Boolean(checklist?.page);

  return (
    <section className="step" aria-labelledby="h-4">
      <h2 id="h-4" tabIndex={-1}>
        Skills checklist
      </h2>
      <p className="step-lead">
        Each specialty has its own checklist. Choose yours, complete it, then
        upload it here.
      </p>

      <FieldWrap error={errors.checklist_specialty}>
        <label htmlFor="checklist_specialty">
          Which checklist applies to you?
          <ReqMark />
        </label>
        <select
          id="checklist_specialty"
          name="checklist_specialty"
          aria-required
          value={values.checklist_specialty}
          onChange={(e) => {
            const next = e.target.value;
            onChange("checklist_specialty", next);
            if (next === "other" || next === "") {
              onChange("checklist_method", "");
            }
          }}
        >
          <option value="">Select a specialty</option>
          {checklistGroups().map((g) => (
            <optgroup key={g.group} label={g.group}>
              {g.items.map(({ index, item }) => (
                <option key={`${g.group}-${item.label}`} value={String(index)}>
                  {item.label}
                </option>
              ))}
            </optgroup>
          ))}
          <option value="other">My specialty is not listed</option>
        </select>
      </FieldWrap>

      {isListed && checklist ? (
        <div id="checklist-guide">
          <div className="note" style={{ marginTop: 20 }}>
            <p>
              <strong>How to complete it</strong>
            </p>
            <ol>
              <li>Open the checklist and rate each skill.</li>
              <li>
                <strong>Do not submit it online.</strong> Choose Print, then Save
                as PDF.
              </li>
              <li>
                Upload the PDF below. You can also print it, fill it in by hand
                and upload a clear photo.
              </li>
            </ol>
          </div>
          <a
            className="btn btn-ghost checklist-link"
            id="checklist-link"
            href={checklistHref(checklist)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!isEmbedded) return;
              e.preventDefault();
              setViewerOpen(true);
            }}
          >
            {isEmbedded ? "Open the checklist" : "Open the checklist in a new tab"}
          </a>
        </div>
      ) : null}

      {viewerOpen && checklist ? (
        <ChecklistViewer
          title={checklist.label}
          src={checklistHref(checklist)}
          onClose={() => setViewerOpen(false)}
        />
      ) : null}

      {v === "other" ? (
        <div className="note alert" style={{ marginTop: 20 }}>
          <p>
            We will send you the right checklist for your specialty. You can
            continue and finish the rest of the application in the meantime.
          </p>
        </div>
      ) : null}

      {isListed ? (
        <div style={{ marginTop: 28 }}>
          <fieldset
            className={`field${errors.checklist_method ? " invalid" : ""}`}
          >
            <legend>
              How would you like to complete it?
              <ReqMark />
            </legend>
            <div className="choices vertical">
              <label className="choice">
                <input
                  type="radio"
                  name="checklist_method"
                  value="upload"
                  checked={values.checklist_method === "upload"}
                  onChange={() => onChange("checklist_method", "upload")}
                />
                <span>I will complete it and upload it here</span>
              </label>
              <label className="choice">
                <input
                  type="radio"
                  name="checklist_method"
                  value="phone"
                  checked={values.checklist_method === "phone"}
                  onChange={() => onChange("checklist_method", "phone")}
                />
                <span>
                  I would like a recruiter to help me complete it by phone
                </span>
              </label>
            </div>
            {errors.checklist_method ? (
              <ErrorText error={errors.checklist_method} />
            ) : null}
          </fieldset>

          {values.checklist_method === "upload" ? (
            <div className="cond">
              <FileDrop
                id="file-checklist"
                label="Completed skills checklist"
                hint={`or drop it here. PDF, JPG, PNG or HEIC, up to ${FORM_CONFIG.maxFileMB} MB.`}
                accept=".pdf,.jpg,.jpeg,.png,.heic,application/pdf,image/*"
                files={files.checklist}
                error={errors.checklist}
                onChange={(next, message) => onFiles("checklist", next, message)}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
