import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import ConfigService from "./services/ConfigService";

import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
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
