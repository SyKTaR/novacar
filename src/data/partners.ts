export type Partner = {
  id: string;
  /** À renseigner uniquement après réception des éléments officiels. */
  logo?: string;
  name?: string;
};

// Huit emplacements neutres donnent assez de largeur à la boucle continue.
export const PARTNERS: Partner[] = Array.from({ length: 8 }, (_, index) => ({
  id: `partner-slot-${index + 1}`,
}));
