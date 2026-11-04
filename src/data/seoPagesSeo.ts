import { SERVICE_CATEGORIES } from "./services.ts";
import {
  DEPARTMENTS,
  SERVICE_PAGE_LIST,
  SITE_ORIGIN,
  ZONES_PAGE,
  type ServicePageContent,
} from "./seoPages.ts";
import type { FaqItem } from "./faq.ts";

/**
 * SEO (title, description, JSON-LD) des pages dédiées. Fichier séparé de
 * src/seo.ts pour limiter les conflits de merge : seo.ts ne fait que spread
 * `SEO_PAGE_ENTRIES` dans sa table.
 */

const ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
const WEBSITE_ID = `${SITE_ORIGIN}/#website`;
const BUSINESS_ID = `${SITE_ORIGIN}/#business`;
const LOGO_URL = `${SITE_ORIGIN}/apple-touch-icon.png`;
const SOCIAL_IMAGE_URL = `${SITE_ORIGIN}/og-image.jpg`;
const INSTAGRAM_URL = "https://www.instagram.com/novacar_smartrepair/";

const AREA_SERVED = { "@type": "AdministrativeArea", name: "Île-de-France" };

/** Nœuds minimaux, mêmes @id que la home, pour que les références se résolvent dans la page. */
const SHARED_NODES = [
  {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_ORIGIN}/`,
    name: "Novacar",
    inLanguage: "fr-FR",
    publisher: { "@id": BUSINESS_ID },
  },
  {
    "@type": "AutoRepair",
    "@id": BUSINESS_ID,
    name: "Novacar",
    url: `${SITE_ORIGIN}/`,
    logo: LOGO_URL,
    image: SOCIAL_IMAGE_URL,
    sameAs: [INSTAGRAM_URL],
    areaServed: AREA_SERVED,
  },
];

function breadcrumb(path: string, label: string) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${SITE_ORIGIN}${path}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_ORIGIN}/` },
      { "@type": "ListItem", position: 2, name: label, item: `${SITE_ORIGIN}${path}` },
    ],
  };
}

function faqNode(path: string, faq: FaqItem[]) {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_ORIGIN}${path}#faq`,
    isPartOf: { "@id": `${SITE_ORIGIN}${path}#webpage` },
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

function webPageNode(path: string, name: string, description: string, about: string) {
  return {
    "@type": "WebPage",
    "@id": `${SITE_ORIGIN}${path}#webpage`,
    url: `${SITE_ORIGIN}${path}`,
    name,
    description,
    inLanguage: "fr-FR",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": about },
    breadcrumb: { "@id": `${SITE_ORIGIN}${path}#breadcrumb` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: SOCIAL_IMAGE_URL,
      width: 1200,
      height: 630,
    },
  };
}

function serviceGraph(page: ServicePageContent) {
  const category = SERVICE_CATEGORIES.find((entry) => entry.id === page.id)!;
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...SHARED_NODES,
      webPageNode(page.path, page.metaTitle, page.metaDescription, page.schemaId),
      breadcrumb(page.path, page.navLabel),
      {
        // Même @id que le nœud Service de la page d'accueil : enrichi ici de l'URL de la page et des tarifs.
        "@type": "Service",
        "@id": page.schemaId,
        name: page.schemaName,
        serviceType: page.schemaServiceType,
        description: page.schemaDescription,
        url: `${SITE_ORIGIN}${page.path}`,
        mainEntityOfPage: { "@id": `${SITE_ORIGIN}${page.path}#webpage` },
        provider: { "@id": BUSINESS_ID },
        areaServed: AREA_SERVED,
        hasOfferCatalog: {
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
        },
      },
      faqNode(page.path, page.faq),
    ],
  };
}

function zonesGraph() {
  const path = ZONES_PAGE.path;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...SHARED_NODES[0],
      },
      {
        ...SHARED_NODES[1],
        areaServed: {
          "@type": "AdministrativeArea",
          name: "Île-de-France",
          containsPlace: DEPARTMENTS.map((department) => ({
            "@type": "AdministrativeArea",
            name: `${department.name} (${department.code})`,
          })),
        },
      },
      webPageNode(path, ZONES_PAGE.metaTitle, ZONES_PAGE.metaDescription, BUSINESS_ID),
      breadcrumb(path, ZONES_PAGE.navLabel),
      faqNode(path, ZONES_PAGE.faq),
    ],
  };
}

export const SEO_PAGE_ENTRIES = {
  ...Object.fromEntries(
    SERVICE_PAGE_LIST.map((page) => [
      page.path,
      {
        title: page.metaTitle,
        description: page.metaDescription,
        path: page.path,
        robots: ROBOTS,
        structuredData: serviceGraph(page),
      },
    ]),
  ),
  [ZONES_PAGE.path]: {
    title: ZONES_PAGE.metaTitle,
    description: ZONES_PAGE.metaDescription,
    path: ZONES_PAGE.path,
    robots: ROBOTS,
    structuredData: zonesGraph(),
  },
};
