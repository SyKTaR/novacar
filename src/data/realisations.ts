import type { PhotoName } from "./photos";

export type RealisationCategory = "jantes" | "peinture" | "lustrage";

export type Realisation = {
  id: string;
  /** Titre court affiché sous l'image. */
  title: string;
  category: RealisationCategory;
  /** Étiquette de catégorie (pastille). */
  categoryLabel: string;
  /** Courte description de l'intervention réalisée. */
  description: string;
  /**
   * Photos avant / après : noms des variantes optimisées de src/assets/photos
   * (générées par scripts/optimize-photos.py). Une paire doit toujours être
   * affichée avec le même recadrage (`position` s'applique aux deux).
   */
  beforePhoto: PhotoName;
  afterPhoto: PhotoName;
  /** object-position partagé par les deux photos de la paire. */
  position: string;
  beforeAlt: string;
  afterAlt: string;
};

/**
 * Réalisations affichées dans la section « Nos réalisations ».
 * Photos client reçues le 2026-11-03 (paires 01 à 04) ; le lustrage conserve
 * ses visuels précédents. Aucune marque de véhicule dans les textes.
 */
export const REALISATIONS: Realisation[] = [
  {
    id: "renovation-jante",
    title: "Rénovation de jante",
    category: "jantes",
    categoryLabel: "Jantes",
    description: "Jante abîmée par un trottoir, reprise et repeinte dans sa teinte d’origine.",
    beforePhoto: "01-jante-avant",
    afterPhoto: "01-jante-apres",
    position: "center 55%",
    beforeAlt: "Jante argent rayée par un trottoir avant rénovation",
    afterAlt: "Même jante après rénovation, peinture argent refaite",
  },
  {
    id: "retouche-bouclier",
    title: "Retouche de bouclier",
    category: "peinture",
    categoryLabel: "Carrosserie",
    description: "Rayure sur la lèvre avant, reprise et raccordée à la teinte d’origine.",
    beforePhoto: "02-bouclier-rouge-avant",
    afterPhoto: "02-bouclier-rouge-apres",
    position: "center",
    beforeAlt: "Rayure sur la lèvre avant d’un bouclier rouge",
    afterAlt: "Bouclier rouge après retouche, rayure effacée",
  },
  {
    id: "reparation-bouclier",
    title: "Réparation de bouclier",
    category: "peinture",
    categoryLabel: "Carrosserie",
    description: "Bouclier avant fissuré, repris et repeint.",
    beforePhoto: "03-bouclier-blanc-avant",
    afterPhoto: "03-bouclier-blanc-apres",
    position: "center",
    beforeAlt: "Bouclier avant blanc fissuré près de l’antibrouillard",
    afterAlt: "Bouclier blanc réparé et repeint",
  },
  {
    id: "renovation-jante-anthracite",
    title: "Rénovation de jante",
    category: "jantes",
    categoryLabel: "Jantes",
    description: "Jante rayée sur le bord, reprise et repeinte.",
    beforePhoto: "04-jante-anthracite-avant",
    afterPhoto: "04-jante-anthracite-apres",
    position: "center 55%",
    beforeAlt: "Jante anthracite rayée sur le bord",
    afterAlt: "Jante anthracite après rénovation",
  },
  {
    id: "lustrage",
    title: "Lustrage du capot",
    category: "lustrage",
    categoryLabel: "Lustrage",
    description: "Carrosserie ternie reprise en lustrage, reflet net retrouvé.",
    beforePhoto: "lustrage-avant",
    afterPhoto: "lustrage-apres",
    position: "center",
    beforeAlt: "Carrosserie ternie avant lustrage",
    afterAlt: "Carrosserie lustrée, reflet net retrouvé",
  },
];
