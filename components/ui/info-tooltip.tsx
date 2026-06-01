"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type InfoTooltipProps = {
  /** The explanatory text shown in the bubble. */
  content: ReactNode;
  /** Optional bold heading shown above the content. */
  title?: string;
  /** Accessible label for the trigger, e.g. "More about Transaction Authorization Policy". */
  label?: string;
  /** Which side the bubble opens toward relative to the icon. */
  side?: "top" | "bottom";
  /** Horizontal alignment of the bubble against the icon. */
  align?: "center" | "start" | "end";
  className?: string;
};

type Coords = { top: number; left: number; caretLeft: number };

const BUBBLE_WIDTH = 264;

export function InfoTooltip({
  content,
  title,
  label = "More information",
  side = "top",
  align = "center",
  className = "",
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const id = useId();

  useEffect(() => setMounted(true), []);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const bubble = bubbleRef.current;
    const width = bubble?.offsetWidth ?? BUBBLE_WIDTH;
    const height = bubble?.offsetHeight ?? 0;
    const gap = 10;
    const margin = 8;

    let top = side === "top" ? rect.top - height - gap : rect.bottom + gap;
    let left =
      align === "center"
        ? rect.left + rect.width / 2 - width / 2
        : align === "end"
          ? rect.right - width
          : rect.left;

    left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - height - margin));

    const caretLeft = Math.max(16, Math.min(rect.left + rect.width / 2 - left, width - 16));
    setCoords({ top, left, caretLeft });
  }, [side, align]);

  useEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }

    updatePosition();

    const reposition = () => updatePosition();
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || bubbleRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, updatePosition]);

  return (
    <span className={`inline-flex align-middle ${className}`}>
      <button
        ref={triggerRef}
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
      {mounted && open
        ? createPortal(
            <span
              ref={bubbleRef}
              role="tooltip"
              id={id}
              style={{
                position: "fixed",
                top: coords?.top ?? -9999,
                left: coords?.left ?? -9999,
                width: BUBBLE_WIDTH,
                maxWidth: "calc(100vw - 1rem)",
                visibility: coords ? "visible" : "hidden",
              }}
              className="z-[1000] block rounded-xl border border-ops-border bg-ops-elevated px-3.5 py-2.5 text-xs leading-relaxed text-ops-text-secondary shadow-[var(--ops-shadow-lg)]"
            >
              {title ? (
                <span className="mb-1 block text-[13px] font-semibold text-ops-text">{title}</span>
              ) : null}
              <span className="block">{content}</span>
              <span
                aria-hidden
                style={{
                  left: coords?.caretLeft ?? 0,
                  [side === "top" ? "bottom" : "top"]: -5,
                }}
                className={`absolute h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-ops-border bg-ops-elevated ${
                  side === "top" ? "border-b border-r" : "border-t border-l"
                }`}
              />
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
