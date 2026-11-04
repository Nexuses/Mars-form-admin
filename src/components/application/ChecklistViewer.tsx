"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function ChecklistViewer({
  title,
  src,
  onClose,
}: {
  title: string;
  src: string;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!mounted) return null;

  // Rendered at body level so page styles (such as .step h2) cannot reach into it.
  return createPortal(
    <div className="cl-modal" role="dialog" aria-modal="true" aria-labelledby="cl-title">
      <div className="cl-bar">
        <h2 id="cl-title">{title} skills checklist</h2>
        <button
          type="button"
          className="cl-close"
          ref={closeRef}
          onClick={onClose}
        >
          Close and return to application
        </button>
      </div>
      <iframe
        className="cl-frame"
        title={`${title} skills checklist`}
        src={src}
        sandbox="allow-scripts allow-modals allow-same-origin allow-popups allow-forms allow-downloads"
      />
    </div>,
    document.body,
  );
}
