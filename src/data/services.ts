export type ServiceCategoryId = "jantes" | "peinture" | "lustrage";

export type ServiceItem = {
  title: string;
  price: number | "Sur devis";
  unit?: string;
  /**
   * Brief interne pour le photographe (ce que doit montrer la photo à venir),
   * repris du concept de la maquette. Conservé dans la donnée pour préparer
   * les futures prises de vue ; l'interface affiche un placeholder générique.
   */
  shotBrief: string;
  /**
   * true = contenu non confirmé à signaler dans l'interface. Tous les
   * tarifs présents dans la liste actuelle ont été fournis par Lucas ; la
   * propriété reste disponible pour identifier d'éventuels ajouts futurs.
   */
  isPlaceholder?: boolean;
};

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
    tag: "Retouche jantes",
    items: [
      {
        title: "Jante classique",
        price: 79,
        unit: "HT / jante",
        shotBrief: "Jante alu argent brossée, 3/4 face, fond sombre",
      },
      {
        title: "Jante poli bi-ton",
        price: 120,
        unit: "HT / jante",
        shotBrief: "Jante bi-ton : face polie brillante + creux anthracite",
      },
      {
        title: "Jante noir",
        price: 100,
        unit: "HT / jante",
        shotBrief: "Jante noire rénovée, vue de face sur fond sombre",
      },
      {
        title: "Jante mat / satinée",
        price: 120,
        unit: "HT / jante",
        shotBrief: "Jante finition mate ou satinée, détail de matière",
      },
      {
        title: "Jante teinte spécial effet chrome",
        price: 120,
        unit: "HT / jante",
        shotBrief: "Jante avec finition effet chrome, éclairage contrôlé",
      },
      {
        title: "Jante avec arrachement / vernie / repeinte",
        price: "Sur devis",
        shotBrief: "Détail d'une jante nécessitant une reprise spécifique",
      },
    ],
  },
  {
    id: "peinture",
    label: "Retouche peinture",
    tag: "Retouche peinture",
    items: [
      {
        title: "Retouche par choc",
        price: 89,
        unit: "HT / impact",
        shotBrief: "Impact de choc sur portière, lumière rasante",
      },
      {
        title: "Retouche par choc teinte nacrée",
        price: 100,
        unit: "HT / impact",
        shotBrief: "Peinture nacrée, détail du raccord de teinte au soleil",
      },
      {
        title: "Retouche rétroviseur / poignée",
        price: 45,
        unit: "HT / élément",
        shotBrief: "Rétroviseur ou poignée avec retouche localisée",
      },
      {
        title: "Retouche élargisseur",
        price: 55,
        unit: "HT / élément",
        shotBrief: "Élargisseur d'aile avec retouche localisée",
      },
      {
        title: "Retouche baguette de porte",
        price: 69,
        unit: "HT / élément",
        shotBrief: "Baguette de porte après reprise de peinture",
      },
      {
        title: "Rénovation optique vernis",
        price: 55,
        unit: "HT / élément",
        shotBrief: "Optique rénové et reverni, détail avant / après",
      },
    ],
  },
  {
    id: "lustrage",
    label: "Lustrage",
    tag: "Lustrage",
    items: [
      {
        title: "Lustrage élément",
        price: 55,
        unit: "HT / élément",
        shotBrief: "Élément de carrosserie lustré, reflet net en lumière rasante",
      },
      {
        title: "Autre demande",
        price: "Sur devis",
        shotBrief: "Vue d'ensemble du véhicule pour une demande personnalisée",
      },
    ],
  },
];
