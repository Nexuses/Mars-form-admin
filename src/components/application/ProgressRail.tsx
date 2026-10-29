"use client";

import { STEP_TITLES } from "@/lib/application/config";

export function ProgressRail({
  current,
  complete,
  onJump,
}: {
  current: number;
  complete?: boolean;
  onJump: (index: number) => void;
}) {
  const title = complete ? "Complete" : STEP_TITLES[current];
  const count = complete
    ? "Complete"
    : `Step ${current + 1} of ${STEP_TITLES.length}`;
  const fill = complete ? 100 : ((current + 1) / STEP_TITLES.length) * 100;

  return (
    <nav className="rail" aria-label="Application progress">
      <h2>Your application</h2>
      <ol>
        {STEP_TITLES.map((label, i) => {
          const done = complete || i < current;
          const isCurrent = !complete && i === current;
          return (
            <li
              key={label}
              className={`${done ? "done" : ""}${isCurrent ? " current" : ""}`.trim()}
            >
              <button
                type="button"
                className="rail-btn"
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => onJump(i)}
              >
                <span className="rail-dot" aria-hidden="true">
                  {done ? "✓" : String(i + 1)}
                </span>
                <span>{label}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mprog" aria-hidden="true">
        <div className="mprog-label">
          <span>{title}</span>
          <span>{count}</span>
        </div>
        <div className="mprog-bar">
          <span className="mprog-fill" style={{ width: `${fill}%` }} />
        </div>
      </div>
    </nav>
  );
}
