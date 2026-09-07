import type { ComponentType } from "react";
import App from "./App";
import Cookies from "./pages/Cookies";
import MentionsLegales from "./pages/MentionsLegales";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";

export const PRERENDER_ROUTES = [
  "/",
  "/mentions-legales",
  "/politique-confidentialite",
  "/cookies",
] as const;

const ROUTES: Record<string, ComponentType> = {
  "/mentions-legales": MentionsLegales,
  "/politique-confidentialite": PolitiqueConfidentialite,
  "/cookies": Cookies,
};

export function normalizePath(path: string) {
  return path.replace(/\/+$/, "") || "/";
}

export function resolveRoute(path: string): ComponentType {
  return ROUTES[normalizePath(path)] ?? App;
}
