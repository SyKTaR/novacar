import type { ComponentType } from "react";
import App from "./App";
import Cookies from "./pages/Cookies";
import MentionsLegales from "./pages/MentionsLegales";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";
import NotFound from "./pages/NotFound";
import { JantesPage, LustragePage, PeinturePage, ZonesPage } from "./pages/services";
import { SEO_PAGE_PATHS } from "./data/seoPages";

export const PRERENDER_ROUTES = [
  "/",
  "/mentions-legales",
  "/politique-confidentialite",
  "/cookies",
  "/404",
  SEO_PAGE_PATHS.jantes,
  SEO_PAGE_PATHS.peinture,
  SEO_PAGE_PATHS.lustrage,
  SEO_PAGE_PATHS.zones,
] as const;

const ROUTES: Record<string, ComponentType> = {
  "/": App,
  "/mentions-legales": MentionsLegales,
  "/politique-confidentialite": PolitiqueConfidentialite,
  "/cookies": Cookies,
  "/404": NotFound,
  [SEO_PAGE_PATHS.jantes]: JantesPage,
  [SEO_PAGE_PATHS.peinture]: PeinturePage,
  [SEO_PAGE_PATHS.lustrage]: LustragePage,
  [SEO_PAGE_PATHS.zones]: ZonesPage,
};

export function normalizePath(path: string) {
  return path.replace(/\/+$/, "") || "/";
}

// Toute route non reconnue (URL cassée, lien externe erroné, faute de
// frappe) rend la page 404 côté client, pour matcher exactement ce que
// Vercel sert statiquement via `dist/404.html` sur ces mêmes URLs.
export function resolveRoute(path: string): ComponentType {
  return ROUTES[normalizePath(path)] ?? NotFound;
}
