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
  bullets: [string, string, string];
  subtitles: Record<string, string>;
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
    description: "Un lustrage à l'échelle d'un élément de carrosserie. Pour une autre demande, précisez les zones à traiter.",
    bullets: ["Lustrage par élément de carrosserie", "Finition de la surface peinte", "Autres demandes sur devis"],
    subtitles: {
      "Lustrage d’un élément": "Finition de la peinture sur un élément de carrosserie",
      "Autre demande": "Précisez les éléments du véhicule à traiter",
    },
  },
};

/** Return the whole item so the unit belongs to the actual minimum price. */
export function minimumService(items: ServiceItem[]): ServiceItem | undefined {
  return items.reduce<ServiceItem | undefined>((minimum, item) => {
    if (typeof item.price !== "number") return minimum;
    return !minimum || typeof minimum.price !== "number" || item.price < minimum.price ? item : minimum;
  }, undefined);
}
