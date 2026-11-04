import Photo from "../../components/Photo";
import { SERVICE_PRESENTATION } from "../../data/servicePresentation";
import {
  REALISATION_BY_ID,
  SERVICE_PAGES,
  categoryOf,
  formatPrice,
  type ServicePageSlug,
} from "../../data/seoPages";
import { Breadcrumb, Faq, PageShell, RelatedLinks, Steps } from "./shared";

export default function ServicePage({ slug }: { slug: ServicePageSlug }) {
  const page = SERVICE_PAGES[slug];
  const category = categoryOf(slug);
  const subtitles = SERVICE_PRESENTATION[slug].subtitles;
  const realisations = page.realisationIds.map(REALISATION_BY_ID);

  return (
    <PageShell title={page.metaTitle}>
      <section className={`sp-hero${page.heroPhoto ? " sp-hero--photo" : ""}`} aria-labelledby="sp-title">
        <div className="sp-hero-inner">
          <div className="sp-hero-copy">
            <Breadcrumb label={page.navLabel} />
            <p className="sp-eyebrow">{page.eyebrow}</p>
            <h1 id="sp-title">{page.h1}</h1>
            {page.intro.map((paragraph) => (
              <p className="sp-lead" key={paragraph}>
                {paragraph}
              </p>
            ))}
            <div className="sp-actions">
              <a className="btn btn-primary" href="/#contact">
                Demander un devis
              </a>
              <a className="btn btn-secondary" href="#tarifs-page">
                Voir les tarifs
              </a>
            </div>
          </div>
          {page.heroPhoto && (
            <div className="sp-hero-media">
              <Photo
                name={page.heroPhoto.name}
                alt={page.heroPhoto.alt}
                sizes="(min-width: 62rem) 30rem, 90vw"
                position={page.heroPhoto.position}
                eager
              />
            </div>
          )}
        </div>
      </section>

      <section id="tarifs-page" className="sp-section" aria-labelledby="sp-items-title">
        <div className="sp-section-head">
          <h2 id="sp-items-title">{page.itemsTitle}</h2>
          <p>{page.itemsIntro}</p>
        </div>
        <div className="sp-section-body">
          <ul className="sp-price-list">
            {category.items.map((item) => (
              <li key={item.title} className="sp-price-row">
                <div className="sp-price-copy">
                  <h3>{item.title}</h3>
                  <p>{subtitles[item.title]}</p>
                </div>
                <p className={`sp-price${typeof item.price === "number" ? "" : " sp-price--quote"}`}>
                  {formatPrice(item)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sp-section" aria-labelledby="sp-results-title">
        <div className="sp-section-head">
          <h2 id="sp-results-title">{page.resultsTitle}</h2>
          <p>{page.resultsIntro}</p>
        </div>
        <div className="sp-section-body">
          <div className="sp-results">
            {realisations.map((item) => (
              <figure className="sp-result" key={item.id}>
                <div className="sp-result-pair">
                  <div className="sp-result-shot">
                    <Photo
                      name={item.beforePhoto}
                      alt={item.beforeAlt}
                      sizes="(min-width: 62rem) 18rem, 45vw"
                      position={item.position}
                    />
                    <span>Avant</span>
                  </div>
                  <div className="sp-result-shot">
                    <Photo
                      name={item.afterPhoto}
                      alt={item.afterAlt}
                      sizes="(min-width: 62rem) 18rem, 45vw"
                      position={item.position}
                    />
                    <span>Après</span>
                  </div>
                </div>
                <figcaption>
                  <strong>{item.title}</strong> — {item.description}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <Steps id="sp-steps" title={page.stepsTitle} steps={page.steps} outro={page.stepsOutro} />
      <Faq id="sp-faq" title={page.faqTitle} items={page.faq} />

      <div className="sp-section sp-section--end">
        <RelatedLinks keys={page.related} />
      </div>
    </PageShell>
  );
}
