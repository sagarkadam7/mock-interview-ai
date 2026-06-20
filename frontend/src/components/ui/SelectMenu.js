import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

function ChevronIcon({ open }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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
 * Menu renders in a portal so it isn't clipped by overflow/stacking on parent cards.
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
}) {
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value) ?? options[0];

  const updateMenuRect = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuRect({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    updateMenuRect();
    const onScrollOrResize = () => updateMenuRect();
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [open, updateMenuRect]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (!triggerRef.current?.contains(e.target) && !panelRef.current?.contains(e.target)) {
        setOpen(false);
      }
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
      ? "select-menu-trigger-pill"
      : "input-field !flex items-center justify-between gap-2 rounded-xl py-3 pl-4 pr-3 text-left";

  const menu =
    open && menuRect
      ? createPortal(
          <ul
            ref={panelRef}
            id={listId}
            role="listbox"
            aria-labelledby={id}
            className="select-menu-panel select-menu-panel-portal"
            style={{
              top: menuRect.top,
              left: menuRect.left,
              width: menuRect.width,
            }}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li key={opt.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`select-menu-option ${isSelected ? "select-menu-option-selected" : ""}`}
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
          </ul>,
          document.body
        )
      : null;

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          ref={triggerRef}
          type="button"
          id={id}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={ariaLabel || selected?.label}
          className={`w-full ${triggerClass} ${disabled ? "cursor-not-allowed opacity-50" : ""} ${open ? "select-menu-trigger-open" : ""}`}
          onClick={() => !disabled && setOpen((o) => !o)}
        >
          <span className="min-w-0 truncate">{selected?.label ?? "Select…"}</span>
          <ChevronIcon open={open} />
        </button>
      </div>
      {menu}
    </>
  );
}
