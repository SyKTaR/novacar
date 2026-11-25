import { SERVICE_CATEGORIES } from "./services.ts";
import { SERVICE_PAGE_LIST, ZONES_PAGE, type ServicePageContent } from "./seoPages.ts";
import type { FaqItem } from "./faq.ts";
import {
  AREA_SERVED,
  BUSINESS_ID,
  SITE_ORIGIN,
  SOCIAL_IMAGE,
  WEBSITE_ID,
  WEBSITE_NODE,
  breadcrumbNode,
  businessNode,
  offerCatalog,
} from "./business.ts";

/**
 * SEO (title, description, JSON-LD) des pages dédiées. Fichier séparé de
 * src/seo.ts pour limiter les conflits de merge : seo.ts ne fait que spread
 * `SEO_PAGE_ENTRIES` dans sa table.
 */

const ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

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
      url: SOCIAL_IMAGE.url,
      width: SOCIAL_IMAGE.width,
      height: SOCIAL_IMAGE.height,
    },
  };
}

/** Nœud Service d'une prestation : même @id et même contenu sur l'accueil et sur la page dédiée. */
export function serviceNode(page: ServicePageContent) {
  const category = SERVICE_CATEGORIES.find((entry) => entry.id === page.id)!;
  return {
    "@type": "Service",
    "@id": page.schemaId,
    name: page.schemaName,
    serviceType: page.schemaServiceType,
    description: page.schemaDescription,
    url: `${SITE_ORIGIN}${page.path}`,
    provider: { "@id": BUSINESS_ID },
    areaServed: AREA_SERVED,
    hasOfferCatalog: offerCatalog(category),
  };
}

function serviceGraph(page: ServicePageContent) {
  const webPage = webPageNode(page.path, page.metaTitle, page.metaDescription, page.schemaId);
  return {
    "@context": "https://schema.org",
    "@graph": [
      WEBSITE_NODE,
      businessNode(),
      webPage,
      breadcrumbNode(page.path, page.navLabel),
      { ...serviceNode(page), mainEntityOfPage: { "@id": webPage["@id"] } },
      faqNode(page.path, page.faq),
    ],
  };
}

function zonesGraph() {
  const path = ZONES_PAGE.path;
  return {
    "@context": "https://schema.org",
    "@graph": [
      WEBSITE_NODE,
      businessNode(),
      webPageNode(path, ZONES_PAGE.metaTitle, ZONES_PAGE.metaDescription, BUSINESS_ID),
      breadcrumbNode(path, ZONES_PAGE.navLabel),
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
