import React, { useEffect, useId, useRef, useState } from "react";

function ChevronIcon({ open }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 dark:text-slate-500 ${open ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.939l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Custom select — styled listbox menu (native <select> dropdowns can't be themed consistently).
 * @param {{ value: string, label: string }[]} options
 * @param {"field"|"pill"} variant
 */
export default function SelectMenu({
  id,
  value,
  onChange,
  options = [],
  className = "",
  variant = "field",
  disabled = false,
  "aria-label": ariaLabel,
  align = "right",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerClass =
    variant === "pill"
      ? "inline-flex min-w-[10.5rem] items-center justify-between gap-2 rounded-full border border-slate-200/90 bg-white/95 py-2.5 pl-4 pr-3 text-sm font-medium text-aura-ink shadow-sm backdrop-blur-sm transition-all hover:border-violet-200/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/35 dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:border-violet-500/40"
      : "input-field !flex items-center justify-between gap-2 rounded-xl py-3 pl-4 pr-3 text-left";

  const menuAlign = align === "left" ? "left-0" : "right-0";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel || selected?.label}
        className={`w-full ${triggerClass} ${disabled ? "cursor-not-allowed opacity-50" : ""} ${open ? "border-violet-300 ring-2 ring-violet-400/20 dark:border-violet-500/50" : ""}`}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        <span className="min-w-0 truncate">{selected?.label ?? "Select…"}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={id}
          className={`absolute ${menuAlign} z-[100] mt-2 min-w-full overflow-hidden rounded-xl border border-slate-200/90 bg-white/95 p-1.5 shadow-lux-lg ring-1 ring-slate-900/[0.04] backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/98 dark:ring-white/[0.06]`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li key={opt.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-150 ${
                    isSelected
                      ? "bg-slate-900 font-semibold text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                      : "font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-900 dark:text-slate-200 dark:hover:bg-violet-950/55 dark:hover:text-violet-100"
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
