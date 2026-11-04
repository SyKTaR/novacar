import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { SERVICE_CATEGORIES, type ServiceItem } from "../data/services";
import { SERVICE_PRESENTATION, minimumService } from "../data/servicePresentation";
import Photo from "./Photo";
import { SEO_PAGE_PATHS } from "../data/seoPages";

function ServicePrice({ item }: { item: ServiceItem }) {
  return (
    <span className={`sv2-price${typeof item.price === "number" ? "" : " sv2-price--quote"}`}>
      <strong>{typeof item.price === "number" ? `${item.price}\u00a0€` : item.price}</strong>
      {item.unit && <span>{item.unit.replace("/", " / ")}</span>}
    </span>
  );
}

export default function ServicesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case "ArrowRight": next = (index + 1) % SERVICE_CATEGORIES.length; break;
      case "ArrowLeft": next = (index + SERVICE_CATEGORIES.length - 1) % SERVICE_CATEGORIES.length; break;
      case "Home": next = 0; break;
      case "End": next = SERVICE_CATEGORIES.length - 1; break;
      default: return;
    }
    event.preventDefault();
    setActiveIndex(next);
    tabRefs.current[next]?.focus({ preventScroll: true });
  }

  return (
    <section
      id="services"
      className="services-v2"
      aria-labelledby="services-title"
      data-active-index={activeIndex}
      style={{ "--sv2-active-index": activeIndex } as CSSProperties}
    >
      <div id="tarifs" className="sv2-inner">
        <header className="sv2-header">
          <div>
            <p className="sv2-eyebrow">Nos prestations</p>
            <h2 id="services-title">Tarifs jantes &amp; carrosserie</h2>
          </div>
          <p className="sv2-intro">
            Prix HT affichés, sans surprise.<br />
            Devis gratuit sous 48 h pour le reste.
          </p>
        </header>

        <div className="sv2-tabs" role="tablist" aria-label="Catégories de prestations">
          <span className="sv2-tab-indicator" aria-hidden="true" />
          {SERVICE_CATEGORIES.map((category, index) => {
            const content = SERVICE_PRESENTATION[category.id];
            return (
              <button
                key={category.id}
                ref={(element) => { tabRefs.current[index] = element; }}
                className="sv2-tab"
                type="button"
                role="tab"
                id={`service-tab-${category.id}`}
                aria-controls={`service-panel-${category.id}`}
                aria-selected={activeIndex === index}
                aria-label={`${content.title}, ${category.items.length} prestations`}
                tabIndex={activeIndex === index ? 0 : -1}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(event) => handleTabKey(event, index)}
              >
                <span className="sv2-tab-long">{content.title}</span>
                <span className="sv2-tab-short">{content.shortTitle}</span>
                <span className="sv2-tab-count" aria-hidden="true">{category.items.length}</span>
              </button>
            );
          })}
        </div>

        {/* Overlapping grid cells reserve the tallest panel without measuring or
            hiding its text from the static HTML. Inert excludes inactive links. */}
        <div className="sv2-panels">
          {SERVICE_CATEGORIES.map((category, index) => {
            const content = SERVICE_PRESENTATION[category.id];
            const minimum = minimumService(category.items);
            const active = activeIndex === index;
            return (
              <div
                key={category.id}
                id={`service-panel-${category.id}`}
                className="sv2-panel"
                role="tabpanel"
                aria-labelledby={`service-tab-${category.id}`}
                aria-hidden={!active}
                inert={!active}
                tabIndex={active ? 0 : -1}
                data-active={active}
              >
                <article className="sv2-card">
                  <div className="sv2-card-media">
                    <Photo name={content.image} alt={content.imageAlt} sizes="(min-width: 62rem) 26rem, 90vw" position={content.imagePosition} />
                  </div>
                  <div className="sv2-card-body">
                    <div className="sv2-card-copy">
                      <h3>{content.title}</h3>
                      <p>{content.description}</p>
                      <ul className="sv2-benefits">
                        {content.bullets.map((bullet) => (
                          <li key={bullet}><span aria-hidden="true">✓</span>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="sv2-card-action">
                      <p className="sv2-starting-price">
                        {minimum ? <><span>À partir de</span><ServicePrice item={minimum} /></> : "Sur devis"}
                      </p>
                      <a className="sv2-quote" href="#contact">Demander un devis</a>
                      <a className="sv2-more" href={SEO_PAGE_PATHS[category.id]}>Détails de la prestation <span aria-hidden="true">→</span></a>
                    </div>
                  </div>
                </article>

                <div className="sv2-list">
                  <div className="sv2-list-header">
                    <span>{category.items.length} {category.id === "jantes" ? "finitions" : "prestations"}</span>
                    <span>Prix HT</span>
                  </div>
                  <ul>
                    {category.items.map((item, itemIndex) => (
                      <li key={item.title} className="sv2-row">
                        <a href="#contact" className="sv2-service-link" aria-label={`Demander un devis : ${item.title}, ${typeof item.price === "number" ? `${item.price} € ${item.unit ?? ""}` : item.price}`}>
                          <span className="sv2-thumbnail" aria-hidden="true">
                            {item.photo ? <Photo name={item.photo} alt="" sizes="72px" minWidth={240} position="center 55%" /> : <span className="sv2-thumbnail-fallback">{String(itemIndex + 1).padStart(2, "0")}</span>}
                          </span>
                          <span className="sv2-service-copy">
                            <span className="sv2-service-title">{item.title}</span>
                            <span className="sv2-service-subtitle">{content.subtitles[item.title]}</span>
                          </span>
                          <span className="sv2-row-price">
                            <ServicePrice item={item} />
                            {category.id === "jantes" && item.price === "Sur devis" && <span className="sv2-quote-delay">sous 48 h</span>}
                          </span>
                          <span className="sv2-row-arrow" aria-hidden="true"><span>→</span></span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="sv2-footer" aria-label="Autre demande">
          <p><strong>Une autre demande ?</strong><span>Envoyez une photo de la zone abîmée, on vous répond avec un prix ferme.</span></p>
          <a href="#contact">Envoyer une photo <span aria-hidden="true">→</span></a>
        </aside>
      </div>
    </section>
  );
}
