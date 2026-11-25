import { SERVICE_CATEGORIES } from "./services.ts";
import { DEPARTMENTS } from "./seoPages.ts";

/**
 * Données d'entreprise utilisées par les données structurées (JSON-LD).
 * Règle : uniquement des informations déjà publiées sur le site
 * (footer, mentions légales, tarifs). Rien n'est ajouté ici qui ne soit
 * visible par un visiteur.
 *
 * Volontairement absents (non publiés ou non confirmés) : adresse d'accueil
 * client / atelier, horaires, note et avis clients, coordonnées GPS.
 * Le siège social (mentions légales) n'est pas présenté comme un lieu
 * d'accueil : à décider avec Novacar avant de l'ajouter en `address`.
 */

export const SITE_ORIGIN = "https://www.nova-car.fr";
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;
export const BUSINESS_ID = `${SITE_ORIGIN}/#business`;
export const LOGO_URL = `${SITE_ORIGIN}/apple-touch-icon.png`;
export const SOCIAL_IMAGE = {
  url: `${SITE_ORIGIN}/og-image.jpg`,
  width: 1200,
  height: 630,
  alt: "Novacar — retouche carrosserie et rénovation de jantes",
};
export const INSTAGRAM_URL = "https://www.instagram.com/novacar_smartrepair/";
/** Footer + mentions légales. */
export const TELEPHONE = "+33185100001";
/** Mentions légales et politique de confidentialité. */
export const EMAIL = "contact@nova-car.fr";
/** Mentions légales. */
export const VAT_ID = "FR81105640007";

/** Paris + 7 départements, tels que listés sur /zones-intervention et dans la FAQ. */
export const AREA_SERVED = {
  "@type": "AdministrativeArea",
  name: "Île-de-France",
  containsPlace: DEPARTMENTS.map((department) => ({
    "@type": "AdministrativeArea",
    name: `${department.name} (${department.code})`,
  })),
};

const NUMERIC_PRICES = SERVICE_CATEGORIES.flatMap((category) =>
  category.items.flatMap((item) => (typeof item.priceTtc === "number" ? [item.priceTtc] : [])),
);
export const PRICE_RANGE = `À partir de ${Math.min(...NUMERIC_PRICES)} € TTC`;

type Category = (typeof SERVICE_CATEGORIES)[number];

/** Catalogue d'offres d'une catégorie, tarifs TTC lus dans services.ts (aucun calcul). */
export function offerCatalog(category: Category) {
  return {
    "@type": "OfferCatalog",
    name: category.label,
    itemListElement: category.items.map((item) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: item.title },
      priceCurrency: "EUR",
      ...(typeof item.priceTtc === "number"
        ? {
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              minPrice: item.priceTtc,
              priceCurrency: "EUR",
              valueAddedTaxIncluded: true,
              ...(item.unit ? { unitText: item.unit } : {}),
            },
          }
        : {}),
    })),
  };
}

export const FULL_OFFER_CATALOG = {
  "@type": "OfferCatalog",
  name: "Prestations et tarifs Novacar",
  itemListElement: SERVICE_CATEGORIES.map(offerCatalog),
};

export const WEBSITE_NODE = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: `${SITE_ORIGIN}/`,
  name: "Novacar",
  inLanguage: "fr-FR",
  publisher: { "@id": BUSINESS_ID },
};

/**
 * Nœud entreprise, identique sur toutes les pages (même @id) pour que Google
 * consolide une seule entité. Le catalogue complet n'est publié que sur
 * l'accueil, où tous les tarifs sont visibles.
 */
export function businessNode({ withCatalog = false } = {}) {
  return {
    "@type": "AutoBodyShop",
    "@id": BUSINESS_ID,
    name: "Novacar",
    url: `${SITE_ORIGIN}/`,
    logo: LOGO_URL,
    image: SOCIAL_IMAGE.url,
    description:
      "Retouche de peinture carrosserie, rénovation de jantes, lustrage et préparation de restitution leasing, à domicile ou en atelier en Île-de-France.",
    telephone: TELEPHONE,
    email: EMAIL,
    vatID: VAT_ID,
    priceRange: PRICE_RANGE,
    areaServed: AREA_SERVED,
    knowsLanguage: "fr-FR",
    sameAs: [INSTAGRAM_URL],
    ...(withCatalog ? { hasOfferCatalog: FULL_OFFER_CATALOG } : {}),
  };
}

export function breadcrumbNode(path: string, label: string) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${SITE_ORIGIN}${path}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_ORIGIN}/` },
      { "@type": "ListItem", position: 2, name: label, item: `${SITE_ORIGIN}${path}` },
    ],
  };
}
