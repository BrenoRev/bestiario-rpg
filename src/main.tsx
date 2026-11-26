import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { EmberBackground } from "./components/EmberBackground";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <EmberBackground />
    <App />
  </StrictMode>,
);
