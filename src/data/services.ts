export type ServiceCategoryId = "jantes" | "peinture" | "lustrage";

export type ServiceItem = {
  title: string;
  price: number | "Sur devis";
  unit?: string;
  /**
   * Brief interne pour le photographe (ce que doit montrer la photo à venir),
   * repris du concept de la maquette. Conservé dans la donnée pour préparer
   * les futures prises de vue ; l'interface affiche un placeholder générique
   * tant qu'aucune photo n'est fournie (voir `photo`).
   */
  shotBrief: string;
  /**
   * Photo réelle de la prestation, une fois fournie par Lucas
   * (src/assets/photos_sections). Si absente, le carrousel affiche le
   * placeholder "Photo à venir".
   */
  photo?: string;
  /**
   * true = contenu non confirmé à signaler dans l'interface. Tous les
   * tarifs présents dans la liste actuelle ont été fournis par Lucas ; la
   * propriété reste disponible pour identifier d'éventuels ajouts futurs.
   */
  isPlaceholder?: boolean;
};

import janteClassique from "../assets/photos_sections/janteclassique.png";
import jantePoliBiTon from "../assets/photos_sections/Jantepolibi-ton.png";
import janteNoir from "../assets/photos_sections/jantenoir.png";
import janteMatSatinee from "../assets/photos_sections/jante-mat-satinee.png";
import janteChrome from "../assets/photos_sections/janteschromes.png";

export type ServiceCategory = {
  id: ServiceCategoryId;
  /** Titre affiché au-dessus du carrousel (usage interne / aria-label). */
  label: string;
  /** Étiquette verticale affichée sur le bord du panneau. */
  tag: string;
  items: ServiceItem[];
};

/**
 * Tarifs "Rénovation jantes", "Retouche peinture" et "Lustrage".
 *
 * L'intégralité des prestations et montants ci-dessous a été confirmée par
 * Lucas le 20 août 2026. Les demandes sans montant fixe sont explicitement
 * représentées par la valeur "Sur devis".
 *
 * Unité affichée en HT uniquement, comme dans la maquette source. Point
 * juridique déjà identifié dans le handoff Astro (§1.3) : si la clientèle
 * cible inclut des particuliers, le prix TTC doit apparaître. Non tranché
 * ici, signalé dans report.md.
 */
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "jantes",
    label: "Rénovation jantes",
    tag: "Retouche de jantes",
    items: [
      {
        title: "Jante classique",
        price: 79,
        unit: "HT/jante",
        shotBrief: "Jante alu argent brossée, 3/4 face, fond sombre",
        photo: janteClassique,
      },
      {
        title: "Jante polie bi-ton",
        price: 120,
        unit: "HT/jante",
        shotBrief: "Jante bi-ton : face polie brillante + creux anthracite",
        photo: jantePoliBiTon,
      },
      {
        title: "Jante noire",
        price: 100,
        unit: "HT/jante",
        shotBrief: "Jante noire rénovée, vue de face sur fond sombre",
        photo: janteNoir,
      },
      {
        title: "Jante mate/satinée",
        price: 120,
        unit: "HT/jante",
        shotBrief: "Jante finition mate ou satinée, détail de matière",
        photo: janteMatSatinee,
      },
      {
        title: "Jante finition effet chrome",
        price: 120,
        unit: "HT/jante",
        shotBrief: "Jante avec finition effet chrome, éclairage contrôlé",
        photo: janteChrome,
      },
      {
        title: "Jante avec arrachement, vernie ou repeinte",
        price: "Sur devis",
        shotBrief: "Détail d’une jante nécessitant une reprise spécifique",
      },
    ],
  },
  {
    id: "peinture",
    label: "Retouche de peinture",
    tag: "Retouche de peinture",
    items: [
      {
        title: "Retouche par choc",
        price: 89,
        unit: "HT/impact",
        shotBrief: "Impact de choc sur portière, lumière rasante",
      },
      {
        title: "Retouche par choc — teinte nacrée",
        price: 100,
        unit: "HT/impact",
        shotBrief: "Peinture nacrée, détail du raccord de teinte au soleil",
      },
      {
        title: "Retouche de rétroviseur/poignée",
        price: 45,
        unit: "HT/élément",
        shotBrief: "Rétroviseur ou poignée avec retouche localisée",
      },
      {
        title: "Retouche d’élargisseur",
        price: 55,
        unit: "HT/élément",
        shotBrief: "Élargisseur d’aile avec retouche localisée",
      },
      {
        title: "Retouche baguette de porte",
        price: 69,
        unit: "HT/élément",
        shotBrief: "Baguette de porte après reprise de peinture",
      },
      {
        title: "Rénovation d’optique avec vernis",
        price: 55,
        unit: "HT/élément",
        shotBrief: "Optique rénové et reverni, détail avant/après",
      },
    ],
  },
  {
    id: "lustrage",
    label: "Lustrage",
    tag: "Lustrage",
    items: [
      {
        title: "Lustrage d’un élément",
        price: 55,
        unit: "HT/élément",
        shotBrief: "Élément de carrosserie lustré, reflet net en lumière rasante",
      },
      {
        title: "Autre demande",
        price: "Sur devis",
        shotBrief: "Vue d’ensemble du véhicule pour une demande personnalisée",
      },
    ],
  },
];
