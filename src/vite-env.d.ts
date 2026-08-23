/// <reference types="vite/client" />

import type Lenis from "lenis";

interface ImportMetaEnv {
  /** Clé publique Web3Forms (formulaire de contact). Voir .env.example. */
  readonly VITE_WEB3FORMS_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    /** Instance Lenis active sur la page d'accueil (absente si prefers-reduced-motion). */
    __lenis?: Lenis;
  }
}
