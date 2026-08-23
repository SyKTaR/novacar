import janteAvant from "../assets/realisations/jante-avant.jpg";
import janteApres from "../assets/realisations/jante-apres.jpg";
import carrosserieAvant from "../assets/realisations/carrosserie-avant.jpg";
import carrosserieApres from "../assets/realisations/carrosserie-apres.jpg";
import lustrageAvant from "../assets/realisations/lustrage_avant.png";
import lustrageApres from "../assets/realisations/lustrage_apres.png";

export type RealisationCategory = "jantes" | "peinture" | "lustrage";

export type Realisation = {
  id: string;
  /** Titre court affiché au-dessus du comparatif. */
  title: string;
  category: RealisationCategory;
  /** Étiquette de catégorie affichée au-dessus du titre. */
  categoryLabel: string;
  /** Courte description de l'intervention réalisée. */
  description: string;
  /**
   * Chemin de la photo "avant" (import Vite, ex.
   * `import beforeJante from "../assets/realisations/jante-avant.jpg"`).
   * `null` si aucune photo n’est disponible : le composant affiche alors
   * un placeholder explicite, jamais une image générée ou une fausse preuve.
   */
  beforeImage: string | null;
  afterImage: string | null;
  /** Texte alternatif à renseigner en même temps que la photo réelle. */
  beforeAlt: string;
  afterAlt: string;
};

/**
 * 3 réalisations, une par grande catégorie de service (voir
 * src/data/services.ts). Chaque réalisation référence actuellement une
 * paire d’images avant/après et des textes alternatifs descriptifs.
 *
 * Pour Lucas : pour brancher une vraie photo, importer le fichier image
 * (placé dans src/assets/realisations/) puis renseigner beforeImage /
 * afterImage et l'alt correspondant ci-dessous. Aucun autre fichier n'a
 * besoin d'être modifié.
 */
export const REALISATIONS: Realisation[] = [
  {
    id: "renovation-jante",
    title: "Rénovation de jante",
    category: "jantes",
    categoryLabel: "Jantes",
    description: "Jante rayée et arrachée, reprise et repeinte à l’identique.",
    beforeImage: janteAvant,
    afterImage: janteApres,
    beforeAlt: "Jante rayée et arrachée avant rénovation",
    afterAlt: "Jante repeinte à l’identique après rénovation",
  },
  {
    id: "retouche-carrosserie",
    title: "Retouche de peinture & carrosserie",
    category: "peinture",
    categoryLabel: "Peinture/carrosserie",
    description: "Impact de choc sur portière, teinte raccordée sans repeindre l’élément entier.",
    beforeImage: carrosserieAvant,
    afterImage: carrosserieApres,
    beforeAlt: "Impact de choc sur portière avant retouche",
    afterAlt: "Portière retouchée, teinte raccordée après intervention",
  },
  {
    id: "lustrage",
    title: "Lustrage",
    category: "lustrage",
    categoryLabel: "Lustrage",
    description: "Carrosserie ternie reprise en lustrage, reflet net retrouvé.",
    beforeImage: lustrageAvant,
    afterImage: lustrageApres,
    beforeAlt: "Carrosserie ternie avant lustrage",
    afterAlt: "Carrosserie lustrée, reflet net retrouvé",
  },
];
