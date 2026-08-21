import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "lenis/dist/lenis.css";
import "../styles.css";
import App from "./App";
import MentionsLegales from "./pages/MentionsLegales";

const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";
const RootPage = normalizedPath === "/mentions-legales" ? MentionsLegales : App;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootPage />
  </StrictMode>,
);
