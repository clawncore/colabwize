import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// ResizeObserver polyfill to fix "ResizeObserver loop completed with undelivered notifications" error
import ResizeObserver from 'resize-observer-polyfill';
if (typeof window !== 'undefined') {
  window.ResizeObserver = ResizeObserver;

  // Additional error handling for ResizeObserver
  window.addEventListener('error', (e) => {
    if (e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
      e.message === 'ResizeObserver loop limit exceeded') {
      e.stopImmediatePropagation();
      return false;
    }
  });
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();