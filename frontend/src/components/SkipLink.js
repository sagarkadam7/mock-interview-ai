import React from "react";

/**
 * WCAG 2.2 bypass block — first focusable target when a keyboard user presses Tab
 * on page load. Renders off-screen until focused, then slides into view.
 */
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
      data-testid="skip-link"
      // Programmatically blur after activation so focus lands on <main> rather than the link.
      onClick={() => {
        const target = document.getElementById("main-content");
        if (target) {
          target.focus({ preventScroll: false });
        }
      }}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        const target = document.getElementById("main-content");
        if (target) target.focus({ preventScroll: false });
      }}
    >
      Skip to main content
    </a>
  );
}
