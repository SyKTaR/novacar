import { FAQ_ITEMS } from "./data/faq.ts";

const SITE_ORIGIN = "https://www.nova-car.fr";
const SOCIAL_IMAGE_URL = `${SITE_ORIGIN}/apple-touch-icon.png`;
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

const HOME_STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AutoRepair",
      "@id": BUSINESS_ID,
      name: "Novacar",
      url: `${SITE_ORIGIN}/`,
      logo: SOCIAL_IMAGE_URL,
      image: SOCIAL_IMAGE_URL,
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
    `<meta property="og:image:width" content="180" />`,
    `<meta property="og:image:height" content="180" />`,
    `<meta property="og:image:alt" content="${imageAlt}" />`,
    `<meta name="twitter:card" content="summary" />`,
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
