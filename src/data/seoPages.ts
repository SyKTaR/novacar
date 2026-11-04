import { SERVICE_CATEGORIES, type ServiceCategoryId, type ServiceItem } from "./services.ts";
import { REALISATIONS } from "./realisations.ts";
import type { PhotoName } from "./photos.ts";
import type { FaqItem } from "./faq.ts";

/**
 * Contenu des pages SEO dédiées (services + zones d'intervention).
 * Règle : aucun fait ici qui ne soit déjà présent sur le site (services.ts,
 * faq.ts, realisations.ts, llms.txt). Les tarifs sont lus dans services.ts.
 */

export const SITE_ORIGIN = "https://www.nova-car.fr";

export const SEO_PAGE_PATHS = {
  jantes: "/renovation-jantes",
  peinture: "/retouche-peinture-carrosserie",
  lustrage: "/lustrage-voiture",
  zones: "/zones-intervention",
} as const;

export type ServicePageSlug = ServiceCategoryId;

export function categoryOf(id: ServiceCategoryId) {
  const category = SERVICE_CATEGORIES.find((entry) => entry.id === id);
  if (!category) throw new Error(`Catégorie inconnue : ${id}`);
  return category;
}

export function itemOf(id: ServiceCategoryId, title: string): ServiceItem {
  const item = categoryOf(id).items.find((entry) => entry.title === title);
  if (!item) throw new Error(`Prestation inconnue : ${title}`);
  return item;
}

/** « 79 € HT / jante » ou « Sur devis ». */
export function formatPrice(item: ServiceItem): string {
  if (typeof item.price !== "number") return "Sur devis";
  return `${item.price} € ${item.unit?.replace("/", " / ") ?? "HT"}`;
}

function priceHt(id: ServiceCategoryId, title: string): string {
  const price = itemOf(id, title).price;
  return `${price} € HT`;
}

function minPrice(id: ServiceCategoryId): number {
  const prices = categoryOf(id).items.flatMap((item) => (typeof item.price === "number" ? [item.price] : []));
  return Math.min(...prices);
}

export type PageRealisation = {
  id: string;
  title: string;
  description: string;
  beforePhoto: PhotoName;
  afterPhoto: PhotoName;
  beforeAlt: string;
  afterAlt: string;
  position: string;
};

export type ServicePageContent = {
  id: ServicePageSlug;
  path: string;
  /** @id du nœud Service déjà publié sur la page d'accueil. */
  schemaId: string;
  navLabel: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  intro: string[];
  heroPhoto?: { name: PhotoName; alt: string; position: string };
  itemsTitle: string;
  itemsIntro: string;
  /** Texte complémentaire sous la liste de tarifs. */
  itemsNote?: string;
  resultsTitle: string;
  resultsIntro: string;
  realisationIds: string[];
  stepsTitle: string;
  steps: string[];
  stepsOutro: string;
  faqTitle: string;
  faq: FaqItem[];
  schemaName: string;
  schemaServiceType: string;
  schemaDescription: string;
  /** Pages liées affichées en fin de page (maillage interne). */
  related: Array<keyof typeof SEO_PAGE_PATHS>;
};

export const REALISATION_BY_ID = (id: string): PageRealisation => {
  const entry = REALISATIONS.find((item) => item.id === id);
  if (!entry) throw new Error(`Réalisation inconnue : ${id}`);
  return entry;
};

export const SERVICE_PAGES: Record<ServicePageSlug, ServicePageContent> = {
  jantes: {
    id: "jantes",
    path: SEO_PAGE_PATHS.jantes,
    schemaId: `${SITE_ORIGIN}/#renovation-jantes`,
    navLabel: "Rénovation de jantes",
    metaTitle: "Rénovation de jantes à domicile en IDF | Novacar",
    metaDescription: `Rénovation de jantes en Île-de-France, à domicile ou en atelier : classique, bi-ton, noire, mate, chrome. Tarifs HT dès ${minPrice("jantes")} € la jante. Devis gratuit.`,
    eyebrow: "Rénovation de jantes",
    h1: "Rénovation de jantes à domicile en Île-de-France",
    intro: [
      "Rayures de trottoir, éclats, envie de changer de teinte : Novacar reprend vos jantes pour les refaire à l’identique ou dans une autre finition, à domicile ou en atelier selon le véhicule et le lieu.",
      `La prestation est facturée à la jante, à partir de ${minPrice("jantes")} € HT. Une jante avec arrachement, à vernir ou à repeindre, est évaluée à partir d’une photo et chiffrée sur devis.`,
    ],
    heroPhoto: {
      name: "jante-polie-biton",
      alt: "Jante bi-ton, face diamantée et creux noirs, après rénovation",
      position: "center 55%",
    },
    itemsTitle: "Finitions de jantes et tarifs HT",
    itemsIntro: "Le prix dépend du type de jante et de la finition choisie. Montants hors taxes, par jante.",
    resultsTitle: "Jantes rénovées : avant et après",
    resultsIntro: "Deux jantes reprises par Novacar, photographiées avant et après l’intervention.",
    realisationIds: ["renovation-jante", "renovation-jante-anthracite"],
    stepsTitle: "Demander un devis pour vos jantes",
    steps: [
      "Indiquez la marque et le modèle du véhicule.",
      "Décrivez l’état des jantes (rayures, éclats, arrachement) et la finition souhaitée.",
      "Joignez si possible une photo nette de la jante à reprendre.",
    ],
    stepsOutro: "Novacar confirme ensuite le tarif et les modalités de l’intervention. Le devis est gratuit.",
    faqTitle: "Questions sur la rénovation de jantes",
    faq: [
      {
        question: "Quelles finitions de jantes pouvez-vous refaire ?",
        answer:
          "Jante classique, polie bi-ton, noire, mate ou satinée et finition effet chrome. Une jante avec arrachement, vernie ou repeinte, fait l’objet d’un devis.",
      },
      {
        question: "Quel est le prix d’une rénovation de jante ?",
        answer: `Le tarif est affiché par jante : ${priceHt("jantes", "Jante classique")} pour une jante classique, ${priceHt("jantes", "Jante noire")} pour une jante noire, ${priceHt("jantes", "Jante polie bi-ton")} pour une jante polie bi-ton, mate ou satinée, ou à finition effet chrome. Les jantes avec arrachement sont sur devis.`,
      },
      {
        question: "Ma jante est très abîmée, est-ce réparable ?",
        answer:
          "Pour un arrachement de matière, il n’y a pas de tarif fixe : envoyez une photo de la jante avec votre demande, Novacar évalue la reprise (vernis ou peinture) et indique le prix dans le devis.",
      },
      {
        question: "Peut-on faire rénover ses jantes chez soi ?",
        answer:
          "Novacar intervient à domicile ou en atelier en Île-de-France. La faisabilité dépend du véhicule, des travaux et du lieu ; elle est confirmée avec le devis.",
      },
    ],
    schemaName: "Rénovation de jantes à domicile",
    schemaServiceType: "Rénovation de jantes automobiles",
    schemaDescription:
      "Rénovation de jantes classiques, polies bi-ton, noires, mates, satinées et à finition effet chrome, à domicile ou en atelier en Île-de-France.",
    related: ["peinture", "lustrage", "zones"],
  },

  peinture: {
    id: "peinture",
    path: SEO_PAGE_PATHS.peinture,
    schemaId: `${SITE_ORIGIN}/#retouche-peinture`,
    navLabel: "Retouche peinture & carrosserie",
    metaTitle: "Retouche peinture & carrosserie mobile IDF | Novacar",
    metaDescription: `Retouche de peinture carrosserie en Île-de-France : impacts, rétroviseurs, poignées, élargisseurs, baguettes. Tarifs HT dès ${minPrice("peinture")} €. Devis gratuit.`,
    eyebrow: "Retouche peinture & carrosserie",
    h1: "Retouche de peinture et carrosserie en Île-de-France",
    intro: [
      "Un impact sur une portière, un rétroviseur marqué, une poignée ou une baguette de porte abîmés : Novacar réalise des retouches de peinture localisées sur la zone concernée, en intervention mobile ou en atelier.",
      `Chaque retouche est facturée à l’impact ou à l’élément, à partir de ${minPrice("peinture")} € HT. Les teintes nacrées ont leur propre tarif, et les dommages particuliers font l’objet d’un devis.`,
    ],
    heroPhoto: {
      name: "carrosserie-apres",
      alt: "Aile et portière grises après retouche de carrosserie",
      position: "center",
    },
    itemsTitle: "Retouches de peinture et tarifs HT",
    itemsIntro: "Le prix dépend de l’élément de carrosserie à reprendre. Montants hors taxes, à l’impact ou à l’élément.",
    resultsTitle: "Carrosserie retouchée : avant et après",
    resultsIntro: "Deux boucliers repris par Novacar, photographiés avant et après l’intervention.",
    realisationIds: ["retouche-bouclier", "reparation-bouclier"],
    stepsTitle: "Demander un devis pour une retouche",
    steps: [
      "Indiquez la marque et le modèle du véhicule.",
      "Précisez l’élément concerné (portière, rétroviseur, poignée, bouclier…) et la nature du dommage.",
      "Joignez si possible une photo nette de la zone à reprendre, en signalant une teinte nacrée le cas échéant.",
    ],
    stepsOutro: "Novacar confirme ensuite le tarif et les modalités de l’intervention. Le devis est gratuit.",
    faqTitle: "Questions sur la retouche de peinture",
    faq: [
      {
        question: "Quels éléments de carrosserie pouvez-vous retoucher ?",
        answer:
          "Les impacts de choc, les rétroviseurs et poignées, les élargisseurs et les baguettes de porte. Novacar propose aussi la rénovation d’optique avec vernis.",
      },
      {
        question: "Combien coûte une retouche de peinture ?",
        answer: `Une retouche par choc est facturée ${priceHt("peinture", "Retouche par choc")} par impact. Un rétroviseur ou une poignée coûte ${priceHt("peinture", "Retouche de rétroviseur/poignée")}, un élargisseur ${priceHt("peinture", "Retouche d’élargisseur")}, une baguette de porte ${priceHt("peinture", "Retouche baguette de porte")} et une rénovation d’optique avec vernis ${priceHt("peinture", "Rénovation d’optique avec vernis")}, chacun par élément.`,
      },
      {
        question: "La teinte nacrée change-t-elle le tarif ?",
        answer: `Oui, la retouche par choc sur teinte nacrée est une prestation à part : ${priceHt("peinture", "Retouche par choc — teinte nacrée")} par impact, contre ${priceHt("peinture", "Retouche par choc")} pour une teinte classique.`,
      },
      {
        question: "Où se déroule la retouche ?",
        answer:
          "À domicile ou en atelier, dans toute l’Île-de-France. Novacar confirme avec le devis si l’intervention est possible selon le véhicule, les travaux et le lieu.",
      },
    ],
    schemaName: "Retouche de peinture carrosserie mobile",
    schemaServiceType: "Retouche de peinture automobile",
    schemaDescription:
      "Retouches de peinture localisées sur impacts, rétroviseurs, poignées, élargisseurs et baguettes de porte, en Île-de-France.",
    related: ["jantes", "lustrage", "zones"],
  },

  lustrage: {
    id: "lustrage",
    path: SEO_PAGE_PATHS.lustrage,
    schemaId: `${SITE_ORIGIN}/#lustrage`,
    navLabel: "Lustrage",
    metaTitle: "Lustrage voiture en Île-de-France | Novacar",
    metaDescription: `Lustrage de carrosserie en Île-de-France, à domicile ou en atelier : ${minPrice("lustrage")} € HT par élément, autres demandes sur devis. Novacar, devis gratuit.`,
    eyebrow: "Lustrage",
    h1: "Lustrage de carrosserie en Île-de-France",
    intro: [
      "Une peinture ternie perd son reflet. Novacar propose un lustrage à l’échelle d’un élément de carrosserie, pour retrouver une surface nette, comme sur le capot photographié plus bas.",
      `Le lustrage est facturé ${priceHt("lustrage", "Lustrage d’un élément")} par élément. Pour une autre demande, indiquez les éléments du véhicule à traiter : le tarif est établi sur devis.`,
    ],
    itemsTitle: "Lustrage et tarifs HT",
    itemsIntro: "Deux cas de figure : un lustrage au tarif affiché, ou une demande personnalisée chiffrée sur devis.",
    resultsTitle: "Lustrage d’un capot : avant et après",
    resultsIntro: "Une carrosserie ternie reprise en lustrage, photographiée avant et après l’intervention.",
    realisationIds: ["lustrage"],
    stepsTitle: "Demander un devis de lustrage",
    steps: [
      "Indiquez la marque et le modèle du véhicule.",
      "Listez les éléments de carrosserie à lustrer.",
      "Joignez si possible une photo nette de la zone ternie.",
    ],
    stepsOutro: "Novacar confirme ensuite le tarif et les modalités de l’intervention. Le devis est gratuit.",
    faqTitle: "Questions sur le lustrage",
    faq: [
      {
        question: "Que couvre le lustrage proposé par Novacar ?",
        answer:
          "Un lustrage par élément de carrosserie, qui reprend la finition de la surface peinte. Les demandes plus larges ou particulières sont étudiées sur devis.",
      },
      {
        question: "Quel est le prix d’un lustrage ?",
        answer: `${priceHt("lustrage", "Lustrage d’un élément")} par élément. Si vous souhaitez traiter plusieurs zones ou formuler une autre demande, précisez-les dans votre message pour recevoir un devis.`,
      },
      {
        question: "Le lustrage se fait-il à domicile ?",
        answer:
          "Novacar se déplace à domicile ou travaille en atelier en Île-de-France. La faisabilité est confirmée avec le devis, selon le véhicule, les travaux et le lieu.",
      },
    ],
    schemaName: "Lustrage automobile",
    schemaServiceType: "Lustrage d’éléments de carrosserie",
    schemaDescription: "Lustrage d’éléments de carrosserie automobile en Île-de-France.",
    related: ["jantes", "peinture", "zones"],
  },
};

export const SERVICE_PAGE_LIST = [SERVICE_PAGES.jantes, SERVICE_PAGES.peinture, SERVICE_PAGES.lustrage];

export const DEPARTMENTS = [
  { code: "75", name: "Paris" },
  { code: "77", name: "Seine-et-Marne" },
  { code: "78", name: "Yvelines" },
  { code: "91", name: "Essonne" },
  { code: "92", name: "Hauts-de-Seine" },
  { code: "93", name: "Seine-Saint-Denis" },
  { code: "94", name: "Val-de-Marne" },
  { code: "95", name: "Val-d’Oise" },
] as const;

export const ZONES_PAGE = {
  path: SEO_PAGE_PATHS.zones,
  navLabel: "Zones d’intervention",
  metaTitle: "Zones d’intervention en Île-de-France | Novacar",
  metaDescription:
    "Novacar intervient à Paris et dans les sept autres départements d’Île-de-France : jantes, retouche de peinture, lustrage. À domicile ou en atelier, devis gratuit.",
  eyebrow: "Zones d’intervention",
  h1: "Zones d’intervention de Novacar en Île-de-France",
  intro: [
    "Novacar se déplace à Paris et dans les sept autres départements franciliens pour la rénovation de jantes, la retouche de peinture et le lustrage. Les interventions ont lieu à domicile ou en atelier.",
  ],
  departmentsTitle: "Les huit départements desservis",
  departmentsIntro:
    "La zone d’intervention couvre l’ensemble de l’Île-de-France : Paris et les sept autres départements franciliens.",
  modeTitle: "À domicile ou en atelier",
  modeText: [
    "L’intervention peut se faire à votre domicile ou en atelier. La faisabilité est confirmée avec le devis, en fonction du véhicule, des travaux à réaliser et du lieu.",
    "Pour que Novacar puisse répondre précisément, précisez dans votre message où se trouve le véhicule.",
  ],
  servicesTitle: "Prestations proposées dans toute la zone",
  stepsTitle: "Vérifier que votre secteur est couvert",
  steps: [
    "Envoyez votre demande de devis depuis le formulaire de contact.",
    "Indiquez la marque et le modèle du véhicule, le dommage à reprendre et le lieu d’intervention.",
    "Ajoutez si possible une photo nette de la zone concernée.",
  ],
  stepsOutro: "Novacar vous répond avec le tarif et les modalités de l’intervention.",
  faqTitle: "Questions sur les zones d’intervention",
  faq: [
    {
      question: "Dans quels départements Novacar intervient-il ?",
      answer:
        "À Paris (75), en Seine-et-Marne (77), dans les Yvelines (78), en Essonne (91), dans les Hauts-de-Seine (92), en Seine-Saint-Denis (93), dans le Val-de-Marne (94) et dans le Val-d’Oise (95).",
    },
    {
      question: "L’intervention est-elle possible partout dans ces départements ?",
      answer:
        "La faisabilité est confirmée avec le devis : elle dépend du véhicule, des travaux et du lieu d’intervention.",
    },
    {
      question: "Faut-il se rendre en atelier ?",
      answer:
        "Pas obligatoirement : Novacar intervient à domicile ou en atelier. Les modalités sont précisées avec le tarif, une fois votre demande reçue.",
    },
  ] as FaqItem[],
  schemaDescription:
    "Zones d’intervention de Novacar : Paris et les sept autres départements d’Île-de-France, à domicile ou en atelier.",
};

export const ZONES_RELATED_SERVICES = SERVICE_PAGE_LIST.map((page) => ({
  path: page.path,
  label: page.navLabel,
  from: `À partir de ${minPrice(page.id)} € HT`,
}));
