import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import ConfigService from "./services/ConfigService";

import reportWebVitals from "./reportWebVitals";

// Suppress known Supabase 'steal' DOMException caused by React StrictMode duplicate renders
// This prevents the Webpack error overlay from crashing the local development view.
const blockLockErrors = (message: any) => {
  if (typeof message === 'string' && message.includes('Lock broken')) return true;
  if (message && message.message && typeof message.message === 'string' && message.message.includes('Lock broken')) return true;
  if (message && message.name === 'AbortError') return true;
  return false;
};

// Intercept window errors
window.addEventListener('unhandledrejection', (event) => {
  if (blockLockErrors(event.reason)) {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  if (blockLockErrors(event.error) || blockLockErrors(event.message)) {
    event.preventDefault();
  }
});

// Intercept console.error to prevent CRA's Error Overlay web socket integration from seeing it
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (args.some(arg => blockLockErrors(arg))) {
    // Optionally log a debug message silently, but do not pass to the original console.error
    return;
  }
  originalConsoleError.apply(console, args);
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
    <App />
);

// Register service worker only in production environment
// Also add additional check to ensure we're not in localhost development
if (
  "serviceWorker" in navigator &&
  ConfigService.getNodeEnv() === "production" &&
  !window.location.hostname.includes("localhost") &&
  window.location.hostname !== "127.0.0.1" &&
  window.location.hostname !== "0.0.0.0"
) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
