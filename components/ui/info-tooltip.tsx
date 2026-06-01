"use client";

import { useId, useState, type ReactNode } from "react";

type InfoTooltipProps = {
  /** The explanatory text shown in the bubble. */
  content: ReactNode;
  /** Accessible label for the trigger, e.g. "More about Transaction Authorization Policy". */
  label?: string;
  /** Which side the bubble opens toward relative to the icon. */
  side?: "top" | "bottom";
  /** Horizontal alignment of the bubble against the icon. */
  align?: "center" | "start" | "end";
  className?: string;
};

const SIDE_CLASS: Record<NonNullable<InfoTooltipProps["side"]>, string> = {
  top: "bottom-full mb-2",
  bottom: "top-full mt-2",
};

const ALIGN_CLASS: Record<NonNullable<InfoTooltipProps["align"]>, string> = {
  center: "left-1/2 -translate-x-1/2",
  start: "left-0",
  end: "right-0",
};

export function InfoTooltip({
  content,
  label = "More information",
  side = "top",
  align = "center",
  className = "",
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className={`relative inline-flex align-middle ${className}`}>
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-ops-text-dim transition hover:text-ops-text focus:outline-none focus-visible:ring-2 focus-visible:ring-ops-primary/40"
      >
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <circle cx="8" cy="8" r="6.5" />
          <path d="M8 7.1v3.4" strokeLinecap="round" />
          <circle cx="8" cy="5" r="0.55" fill="currentColor" stroke="none" />
        </svg>
      </button>
      {open ? (
        <span
          role="tooltip"
          id={id}
          className={`absolute z-50 w-64 max-w-[min(16rem,80vw)] rounded-lg border border-ops-border bg-ops-elevated px-3 py-2 text-xs font-medium leading-relaxed text-ops-text-secondary shadow-[var(--ops-shadow-lg)] ${SIDE_CLASS[side]} ${ALIGN_CLASS[align]}`}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
