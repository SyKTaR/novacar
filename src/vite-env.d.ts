/// <reference types="vite/client" />

import type Lenis from "lenis";

declare global {
  interface Window {
    /** Instance Lenis active sur la page d'accueil (absente si prefers-reduced-motion). */
    __lenis?: Lenis;
  }
}
