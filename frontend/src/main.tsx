import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.js";
import "./index.css"; // This line is required to load Tailwind [cite: 2026-01-02]

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);