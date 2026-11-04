import { FAQ_ITEMS } from "./data/faq.ts";
import { SERVICE_CATEGORIES } from "./data/services.ts";
import { SEO_PAGE_ENTRIES } from "./data/seoPagesSeo.ts";

const SITE_ORIGIN = "https://www.nova-car.fr";
const LOGO_URL = `${SITE_ORIGIN}/apple-touch-icon.png`;
const SOCIAL_IMAGE_URL = `${SITE_ORIGIN}/og-image.jpg`;
const SOCIAL_IMAGE_WIDTH = 1200;
const SOCIAL_IMAGE_HEIGHT = 630;
const WEBSITE_ID = `${SITE_ORIGIN}/#website`;
const WEBPAGE_ID = `${SITE_ORIGIN}/#webpage`;
const INSTAGRAM_URL = "https://www.instagram.com/novacar_smartrepair/";
const BUSINESS_ID = `${SITE_ORIGIN}/#business`;
const AREA_SERVED = {
  "@type": "AdministrativeArea",
  name: "Île-de-France",
};

type SeoConfig = {
  title: string;
  description: string;
  path: string;
  robots: string;
  structuredData?: Record<string, unknown>;
};

// Tarifs réels (HT) issus de src/data/services.ts, sans valeur ajoutée.
const NUMERIC_PRICES = SERVICE_CATEGORIES.flatMap((category) =>
  category.items.flatMap((item) => (typeof item.price === "number" ? [item.price] : [])),
);
const PRICE_RANGE = `${Math.min(...NUMERIC_PRICES)} € - ${Math.max(...NUMERIC_PRICES)} € HT`;

const OFFER_CATALOG = {
  "@type": "OfferCatalog",
  name: "Prestations et tarifs Novacar",
  itemListElement: SERVICE_CATEGORIES.map((category) => ({
    "@type": "OfferCatalog",
    name: category.label,
    itemListElement: category.items.map((item) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: item.title },
      priceCurrency: "EUR",
      ...(typeof item.price === "number"
        ? {
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: item.price,
              priceCurrency: "EUR",
              valueAddedTaxIncluded: false,
              ...(item.unit ? { unitText: item.unit.replace(/^HT\//, "") } : {}),
            },
          }
        : {}),
    })),
  })),
};

const HOME_STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: `${SITE_ORIGIN}/`,
      name: "Novacar",
      inLanguage: "fr-FR",
      publisher: { "@id": BUSINESS_ID },
    },
    {
      "@type": "WebPage",
      "@id": WEBPAGE_ID,
      url: `${SITE_ORIGIN}/`,
      name: "Retouche carrosserie mobile & jantes IDF | Novacar",
      inLanguage: "fr-FR",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": BUSINESS_ID },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: SOCIAL_IMAGE_URL,
        width: SOCIAL_IMAGE_WIDTH,
        height: SOCIAL_IMAGE_HEIGHT,
      },
    },
    {
      "@type": "AutoRepair",
      "@id": BUSINESS_ID,
      name: "Novacar",
      url: `${SITE_ORIGIN}/`,
      logo: LOGO_URL,
      image: SOCIAL_IMAGE_URL,
      sameAs: [INSTAGRAM_URL],
      priceRange: PRICE_RANGE,
      hasOfferCatalog: OFFER_CATALOG,
      description:
        "Retouche de peinture carrosserie mobile, rénovation de jantes et lustrage automobile en Île-de-France.",
      telephone: "+33185100001",
      areaServed: AREA_SERVED,
      knowsLanguage: "fr-FR",
    },
    {
      "@type": "Service",
      "@id": `${SITE_ORIGIN}/#renovation-jantes`,
      name: "Rénovation de jantes à domicile",
      serviceType: "Rénovation de jantes automobiles",
      description:
        "Rénovation de jantes classiques, polies bi-ton, noires, mates, satinées et à finition effet chrome.",
      provider: { "@id": BUSINESS_ID },
      areaServed: AREA_SERVED,
    },
    {
      "@type": "Service",
      "@id": `${SITE_ORIGIN}/#retouche-peinture`,
      name: "Retouche de peinture carrosserie mobile",
      serviceType: "Retouche de peinture automobile",
      description:
        "Retouches de peinture localisées sur impacts, rétroviseurs, poignées, élargisseurs et baguettes de porte.",
      provider: { "@id": BUSINESS_ID },
      areaServed: AREA_SERVED,
    },
    {
      "@type": "Service",
      "@id": `${SITE_ORIGIN}/#lustrage`,
      name: "Lustrage automobile",
      serviceType: "Lustrage d’éléments de carrosserie",
      description: "Lustrage d’éléments de carrosserie automobile en Île-de-France.",
      provider: { "@id": BUSINESS_ID },
      areaServed: AREA_SERVED,
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_ORIGIN}/#faq`,
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
    title: "Retouche carrosserie mobile & jantes IDF | Novacar",
    description:
      "Novacar réalise la retouche peinture carrosserie mobile, la rénovation de jantes et le lustrage à Paris et en Île-de-France. Devis gratuit.",
    path: "/",
    robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
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
  const imageAlt = escapeAttribute("Novacar — retouche carrosserie et rénovation de jantes");

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
    `<meta property="og:image" content="${SOCIAL_IMAGE_URL}" />`,
    `<meta property="og:image:width" content="${SOCIAL_IMAGE_WIDTH}" />`,
    `<meta property="og:image:height" content="${SOCIAL_IMAGE_HEIGHT}" />`,
    `<meta property="og:image:alt" content="${imageAlt}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${SOCIAL_IMAGE_URL}" />`,
    `<meta name="twitter:image:alt" content="${imageAlt}" />`,
  ];

  if (config.structuredData) {
    const jsonLd = JSON.stringify(config.structuredData).replaceAll("<", "\\u003c");
    tags.push(`<script type="application/ld+json">${jsonLd}</script>`);
  }

  return tags.join("\n    ");
}
