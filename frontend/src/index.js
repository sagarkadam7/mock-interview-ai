import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { captureUtmFromUrl } from "./utils/utm";

captureUtmFromUrl();

// CRA dev overlay treats benign ResizeObserver churn as fatal (common with modals/video).
if (typeof window !== "undefined") {
  const roLoop = /ResizeObserver loop (completed with undelivered notifications|limit exceeded)/;
  window.addEventListener(
    "error",
    (e) => {
      if (roLoop.test(e.message)) e.stopImmediatePropagation();
    },
    true
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
