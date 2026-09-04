export type Partner = {
  id: string;
  placeholderLabel: string;
  /** true tant que le logo officiel du partenaire n'a pas été fourni. */
  isPlaceholder: boolean;
};

/**
 * Logos partenaires temporaires.
 * Remplacer chaque entrée et son rendu textuel dès réception des fichiers officiels.
 */
export const PARTNER_LOGO_PLACEHOLDERS: Partner[] = [
  { id: "partner-01", placeholderLabel: "Partenaire 01", isPlaceholder: true },
  { id: "partner-02", placeholderLabel: "Partenaire 02", isPlaceholder: true },
  { id: "partner-03", placeholderLabel: "Partenaire 03", isPlaceholder: true },
  { id: "partner-04", placeholderLabel: "Partenaire 04", isPlaceholder: true },
];
