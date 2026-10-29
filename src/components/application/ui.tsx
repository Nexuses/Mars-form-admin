"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { FORM_CONFIG } from "@/lib/application/config";
import { formatFileSize } from "@/lib/application/format";
import { validateFile } from "@/lib/application/validation";

export function ReqMark() {
  return (
    <>
      <span className="req" aria-hidden="true">
        {" "}
        *
      </span>
      <span className="sr-only"> (required)</span>
    </>
  );
}

export function FieldWrap({
  error,
  className = "",
  children,
}: {
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  const errId = useId();
  return (
    <div className={`field${error ? " invalid" : ""}${className ? ` ${className}` : ""}`}>
      {children}
      {error ? (
        <p className="err" id={errId} aria-live="polite">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function YesNoField({
  name,
  label,
  value,
  error,
  required = true,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  error?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className={`field${error ? " invalid" : ""}`} data-required={required ? "1" : undefined}>
      <legend>
        {label}
        {required ? <ReqMark /> : null}
      </legend>
      <div className="choices">
        {(["Yes", "No"] as const).map((opt) => (
          <label className="choice" key={opt}>
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              aria-required={required || undefined}
              aria-invalid={error ? true : undefined}
              onChange={() => onChange(opt)}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
      {error ? (
        <p className="err" aria-live="polite">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export function FileDrop({
  id,
  label,
  hint,
  optional,
  multiple,
  accept,
  files,
  error,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  optional?: boolean;
  multiple?: boolean;
  accept: string;
  files: File[];
  error?: string;
  onChange: (files: File[], message?: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  function add(list: FileList | File[]) {
    const msgs: string[] = [];
    let next = multiple ? [...files] : [];
    Array.from(list).forEach((f) => {
      const msg = validateFile(f);
      if (msg) {
        msgs.push(msg);
        return;
      }
      if (next.some((x) => x.name === f.name && x.size === f.size)) return;
      if (!multiple) next = [];
      if (next.length >= FORM_CONFIG.maxFilesPerSlot) {
        msgs.push(`You can add up to ${FORM_CONFIG.maxFilesPerSlot} files here.`);
        return;
      }
      next.push(f);
    });
    onChange(next, msgs.join(" ") || undefined);
  }

  return (
    <FieldWrap error={error}>
      <label id={`lbl-${id}`}>
        {label}
        {optional ? (
          <span className="hint" style={{ display: "inline", margin: 0 }}>
            {" "}
            (optional)
          </span>
        ) : (
          <ReqMark />
        )}
      </label>
      <div
        className={`drop${over ? " over" : ""}`}
        onDragEnter={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (e.dataTransfer.files?.length) add(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          id={id}
          multiple={multiple}
          accept={accept}
          aria-labelledby={`lbl-${id}`}
          onChange={(e) => {
            if (e.target.files) add(e.target.files);
            e.target.value = "";
          }}
        />
        <label className="drop-btn" htmlFor={id}>
          {multiple ? "Choose files" : "Choose file"}
        </label>
        <span className="drop-hint">{hint || "or drop them here"}</span>
      </div>
      <ul className="filelist" aria-live="polite">
        {files.map((f, idx) => (
          <li key={`${f.name}-${f.size}-${idx}`}>
            <span>
              <span className="file-name">{f.name}</span>
              <span className="file-size">{formatFileSize(f.size)}</span>
            </span>
            <button
              type="button"
              className="file-remove"
              aria-label={`Remove ${f.name}`}
              onClick={() => {
                const next = files.filter((_, i) => i !== idx);
                onChange(next);
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </FieldWrap>
  );
}

export function OptionalHint() {
  return (
    <span className="hint" style={{ display: "inline", margin: 0 }}>
      {" "}
      (optional)
    </span>
  );
}
