/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Clé publique Web3Forms (formulaire de contact). Voir .env.example. */
  readonly VITE_WEB3FORMS_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
