// Force rebuild to activate new citation patterns - 2026-03-27-10-52
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import ConfigService from "./services/ConfigService";

import reportWebVitals from "./reportWebVitals";

// Suppress known warnings that don't affect functionality:
// 1. Supabase 'Lock broken' DOMException from React StrictMode
// 2. TipTap flushSync warning (known React 18 incompatibility, doesn't break functionality)
const blockKnownWarnings = (message: any) => {
  if (typeof message === 'string') {
    if (message.includes('Lock broken')) return true;
    if (message.includes('flushSync was called from inside a lifecycle method')) return true;
  }
  if (message && message.message && typeof message.message === 'string') {
    if (message.message.includes('Lock broken')) return true;
    if (message.message.includes('flushSync was called from inside a lifecycle method')) return true;
  }
  if (message && message.name === 'AbortError') return true;
  return false;
};

// Intercept window errors
window.addEventListener('unhandledrejection', (event) => {
  if (blockKnownWarnings(event.reason)) {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  if (blockKnownWarnings(event.error) || blockKnownWarnings(event.message)) {
    event.preventDefault();
  }
});

// Intercept console.error to prevent CRA's Error Overlay web socket integration from seeing it
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (args.some(arg => blockKnownWarnings(arg))) {
    // Silently suppress known warnings that don't affect functionality
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
