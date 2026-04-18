import React from "react";

/** WCAG: bypass repeated navigation — first focusable on Tab from page load */
export default function SkipLink() {
  return (
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
  );
}
