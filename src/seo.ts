import { FAQ_ITEMS } from "./data/faq.ts";
import { SERVICE_CATEGORIES } from "./data/services.ts";
import {
  AREA_SERVED,
  BUSINESS_ID,
  SITE_ORIGIN,
  SOCIAL_IMAGE,
  WEBSITE_ID,
  WEBSITE_NODE,
  businessNode,
  offerCatalog,
} from "./data/business.ts";
import { SEO_PAGE_ENTRIES, serviceNode } from "./data/seoPagesSeo.ts";
import { SERVICE_PAGE_LIST } from "./data/seoPages.ts";

const WEBPAGE_ID = `${SITE_ORIGIN}/#webpage`;
const INDEX_ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

type SeoConfig = {
  title: string;
  description: string;
  path: string;
  robots: string;
  structuredData?: Record<string, unknown>;
};

const HOME_TITLE = "Retouche carrosserie mobile & jantes IDF | Novacar";
const HOME_DESCRIPTION =
  "Novacar réalise la retouche peinture, la rénovation de jantes, le lustrage et la préparation de restitution leasing à Paris et en Île-de-France.";

const leasingCategory = SERVICE_CATEGORIES.find((category) => category.id === "leasing");

const HOME_STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    WEBSITE_NODE,
    {
      "@type": "WebPage",
      "@id": WEBPAGE_ID,
      url: `${SITE_ORIGIN}/`,
      name: HOME_TITLE,
      description: HOME_DESCRIPTION,
      inLanguage: "fr-FR",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": BUSINESS_ID },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: SOCIAL_IMAGE.url,
        width: SOCIAL_IMAGE.width,
        height: SOCIAL_IMAGE.height,
      },
    },
    businessNode({ withCatalog: true }),
    // Mêmes nœuds Service (même @id, même contenu) que sur les pages dédiées.
    ...SERVICE_PAGE_LIST.map(serviceNode),
    ...(leasingCategory
      ? [
          {
            "@type": "Service",
            "@id": `${SITE_ORIGIN}/#preparation-restitution-leasing`,
            name: "Préparation de restitution leasing",
            serviceType: "Préparation automobile avant restitution de leasing",
            // Reprend le texte visible de l'onglet « Préparation restitution leasing ».
            description:
              "Packs à prix de départ fixe avant la restitution d’un véhicule en LLD ou LOA : rénovation de jantes et retouche de peinture localisée.",
            provider: { "@id": BUSINESS_ID },
            areaServed: AREA_SERVED,
            hasOfferCatalog: offerCatalog(leasingCategory),
          },
        ]
      : []),
    {
      "@type": "FAQPage",
      "@id": `${SITE_ORIGIN}/#faq`,
      isPartOf: { "@id": WEBPAGE_ID },
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ],
};

const SEO_BY_PATH: Record<string, SeoConfig> = {
  "/": {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    path: "/",
    robots: INDEX_ROBOTS,
    structuredData: HOME_STRUCTURED_DATA,
  },
  "/mentions-legales": {
    title: "Mentions légales | Novacar",
    description: "Mentions légales et informations relatives à l’éditeur du site Novacar.",
    path: "/mentions-legales",
    robots: "noindex, follow",
  },
  "/politique-confidentialite": {
    title: "Politique de confidentialité | Novacar",
    description: "Politique de confidentialité et traitement des données personnelles sur le site Novacar.",
    path: "/politique-confidentialite",
    robots: "noindex, follow",
  },
  "/cookies": {
    title: "Gestion des cookies | Novacar",
    description: "Informations sur les cookies et ressources externes utilisés par le site Novacar.",
    path: "/cookies",
    robots: "noindex, follow",
  },
  ...SEO_PAGE_ENTRIES,
  "/404": {
    title: "Page introuvable | Novacar",
    description: "Cette page n’existe pas ou a été déplacée. Retrouvez nos services Novacar depuis l’accueil.",
    path: "/404",
    robots: "noindex, follow",
  },
};

/** Configuration SEO exacte d'un chemin (sans repli sur l'accueil). */
export function getSeoConfig(path: string): SeoConfig | undefined {
  return SEO_BY_PATH[path.replace(/\/+$/, "") || "/"];
}

/** Une page n'entre dans le sitemap que si elle est explicitement indexable. */
export function isIndexable(path: string) {
  return getSeoConfig(path)?.robots.startsWith("index") ?? false;
}

export { SITE_ORIGIN };

function escapeAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function buildSeoHead(path: string) {
  const normalizedPath = path.replace(/\/+$/, "") || "/";
  const config = SEO_BY_PATH[normalizedPath] ?? SEO_BY_PATH["/"];
  const canonical = `${SITE_ORIGIN}${config.path}`;
  const title = escapeAttribute(config.title);
  const description = escapeAttribute(config.description);
  const robots = escapeAttribute(config.robots);
  const imageAlt = escapeAttribute(SOCIAL_IMAGE.alt);

  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="fr_FR" />`,
    `<meta property="og:site_name" content="Novacar" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${SOCIAL_IMAGE.url}" />`,
    `<meta property="og:image:width" content="${SOCIAL_IMAGE.width}" />`,
    `<meta property="og:image:height" content="${SOCIAL_IMAGE.height}" />`,
    `<meta property="og:image:alt" content="${imageAlt}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${SOCIAL_IMAGE.url}" />`,
    `<meta name="twitter:image:alt" content="${imageAlt}" />`,
  ];

  if (config.structuredData) {
    const jsonLd = JSON.stringify(config.structuredData).replaceAll("<", "\\u003c");
    tags.push(`<script type="application/ld+json">${jsonLd}</script>`);
  }

  return tags.join("\n    ");
}
