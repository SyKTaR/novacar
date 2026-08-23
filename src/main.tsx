import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "lenis/dist/lenis.css";
import "../styles.css";
import App from "./App";
import MentionsLegales from "./pages/MentionsLegales";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";
import Cookies from "./pages/Cookies";

const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";

const ROUTES: Record<string, typeof App> = {
  "/mentions-legales": MentionsLegales,
  "/politique-confidentialite": PolitiqueConfidentialite,
  "/cookies": Cookies,
};

const RootPage = ROUTES[normalizedPath] ?? App;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootPage />
  </StrictMode>,
);
