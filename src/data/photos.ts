import manifest from "../assets/photos/manifest.json";

/** Nom d'une photo optimisée (voir scripts/optimize-photos.py et src/components/Photo.tsx). */
export type PhotoName = keyof typeof manifest;
