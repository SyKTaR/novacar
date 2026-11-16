import type { ServiceCategoryId, ServiceItem } from "./services";
import type { PhotoName } from "./photos";

type ServicePresentation = {
  title: string;
  shortTitle: string;
  image: PhotoName;
  imageAlt: string;
  /** object-position du cadre paysage (jantes en portrait : moyeu centré). */
  imagePosition: string;
  description: string;
  bullets: readonly string[];
  subtitles: Record<string, string>;
  packLabel?: string;
};

/** Editorial content only. services.ts remains the authority for titles,
 * category membership, prices and units. Wheel copy is from Lucas's mockup;
 * paint/polishing copy is proposed for review in the mission report. */
export const SERVICE_PRESENTATION: Record<ServiceCategoryId, ServicePresentation> = {
  jantes: {
    title: "Rénovation de jantes",
    shortTitle: "Jantes",
    image: "jante-polie-biton",
    imageAlt: "Jante bi-ton diamantée et noire rénovée",
    imagePosition: "center 55%",
    description: "Rayures de trottoir, éclats, changement de teinte : vos jantes refaites à l'identique, à domicile ou en atelier.",
    bullets: ["Teinte et finition d'origine", "À domicile ou en atelier, en Île-de-France", "Devis gratuit sous 48 h"],
    subtitles: {
      "Jante classique": "Peinture argent ou teinte unie, reprise à l'identique",
      "Jante polie bi-ton": "Face rediamantée + creux repeints",
      "Jante noire": "Noir brillant profond, vernis haute tenue",
      "Jante mate/satinée": "Finition velours, sans reflet",
      "Jante finition effet chrome": "Reflet miroir, teinte spéciale",
      "Jante avec arrachement, vernie ou repeinte": "Dommage profond : on évalue sur photo",
    },
  },
  peinture: {
    title: "Retouche peinture & carrosserie",
    shortTitle: "Peinture",
    image: "carrosserie-apres",
    imagePosition: "center",
    imageAlt: "Aile et portière grises après retouche de carrosserie",
    description: "Impacts, rétroviseurs, poignées et baguettes : des retouches de peinture localisées selon l'élément concerné.",
    bullets: ["Retouches par impact ou par élément", "Teinte nacrée : prestation dédiée", "Rénovation d'optique avec vernis"],
    subtitles: {
      "Retouche par choc": "Reprise de peinture localisée sur un impact",
      "Retouche par choc — teinte nacrée": "Reprise localisée sur une peinture nacrée",
      "Retouche de rétroviseur/poignée": "Retouche de peinture du rétroviseur ou de la poignée",
      "Retouche d’élargisseur": "Reprise localisée sur un élargisseur d'aile",
      "Retouche baguette de porte": "Reprise de peinture sur une baguette de porte",
      "Rénovation d’optique avec vernis": "Rénovation de l'optique et application de vernis",
    },
  },
  lustrage: {
    title: "Lustrage",
    shortTitle: "Lustrage",
    image: "lustrage-apres",
    imagePosition: "center",
    imageAlt: "Reflets sur le capot bleu d'un véhicule après lustrage",
    description: "Un lustrage à l'échelle d'un élément de carrosserie, chiffré sur devis selon les zones à traiter.",
    bullets: ["Lustrage par élément de carrosserie", "Finition de la surface peinte", "Tarif sur devis selon les éléments"],
    subtitles: {
      "Lustrage d’un élément": "Finition de la peinture, chiffrée selon les éléments à traiter",
    },
  },
  leasing: {
    title: "Préparation restitution leasing",
    shortTitle: "Leasing",
    image: "leasing-section",
    imagePosition: "center",
    imageAlt: "Renault Clio grise garée en bord de route, prête pour la restitution",
    packLabel: "Pack restitution",
    description: "Avant la restitution de votre véhicule en LLD ou LOA, des packs à prix de départ fixe pour remettre jantes et carrosserie en état.",
    bullets: [
      "Packs pour véhicules en LLD ou LOA",
      "Jantes et retouche de peinture localisée",
      "Prix de départ affiché, devis gratuit",
    ],
    subtitles: {
      "Pack 1 jante + 1 retouche de peinture": "Une jante monoton sans arrachement et une retouche de peinture (format A4)",
      "Pack 4 jantes classiques": "Les quatre jantes rénovées avant la restitution",
      "Pack 4 jantes polies bi-ton": "Les quatre jantes polies bi-ton rénovées avant la restitution",
    },
  },
};

/** Return the whole item so the unit belongs to the actual minimum price. */
export function minimumService(items: ServiceItem[]): ServiceItem | undefined {
  return items.reduce<ServiceItem | undefined>((minimum, item) => {
    if (typeof item.priceTtc !== "number") return minimum;
    return !minimum || typeof minimum.priceTtc !== "number" || item.priceTtc < minimum.priceTtc ? item : minimum;
  }, undefined);
}
