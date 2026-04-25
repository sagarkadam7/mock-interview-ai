import React from "react";

const VARIANTS = {
  cta: "btn-cta",
  outline: "btn-outline",
  primary: "btn-primary",
  danger: "btn-danger",
};

/**
 * Unified button/link component for consistent CTAs across the app.
 * Keeps existing Tailwind utility classes (btn-cta, btn-outline, etc.) as the source of truth.
 */
export default function Button({
  as = "button",
  variant = "cta",
  className = "",
  children,
  ...props
}) {
  const Comp = as;
  const base = VARIANTS[variant] || VARIANTS.cta;
  return (
    <Comp className={`${base} ${className}`.trim()} {...props}>
      {children}
    </Comp>
  );
}

