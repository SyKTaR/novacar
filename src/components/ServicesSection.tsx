import { SERVICE_CATEGORIES } from "../data/services";
import ServiceCarousel from "./ServiceCarousel";

/**
 * Section "Services" — panneau orange, tarifs jantes, carrosserie et lustrage.
 *
 * Reprend le concept de la maquette de Lucas (reference/services-mockup.png)
 * et la structure déjà tranchée dans le handoff Astro (carrousels,
 * étiquettes verticales, bande CTA basse), avec une exécution plus soignée
 * (grille de cartes homogène, contrôles de carrousel visibles et labellisés).
 *
 * Contenu des cartes : voir src/data/services.ts (tarifs confirmés par Lucas,
 * avec les demandes sans montant fixe explicitement indiquées sur devis).
 */
export default function ServicesSection() {
  return (
    <section id="services" className="services" aria-labelledby="services-title">
      <div id="tarifs" className="services-panel">
        <a
          className="services-scroll-anchor"
          href="#services"
          aria-label="Aller à la section Services"
        >
          <span aria-hidden="true">↓</span>
        </a>

        <div className="services-content">
          <header className="services-header">
            <p className="services-eyebrow">Nos prestations</p>
            <h2 id="services-title" className="services-title">
              Tarifs jantes, peinture &amp; lustrage
            </h2>
          </header>

          {SERVICE_CATEGORIES.map((category, index) => (
            <div
              className={`services-group services-group--${category.id}`}
              key={category.id}
            >
              {index % 2 === 0 ? (
                <span className="services-tag" aria-hidden="true">
                  <span className="services-tag-inner">{category.tag}</span>
                </span>
              ) : null}
              <ServiceCarousel items={category.items} ariaLabel={category.label} />
              {index % 2 !== 0 ? (
                <span className="services-tag" aria-hidden="true">
                  <span className="services-tag-inner">{category.tag}</span>
                </span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="services-cta">
          <div className="services-cta-text">
            <p className="services-cta-title">Une autre demande ?</p>
            <p className="services-cta-copy">
              Chaque véhicule est différent, on établit un devis gratuit sous 48h.
            </p>
          </div>
          <a className="btn btn-primary" href="#contact">
            Demander un devis
          </a>
        </div>
      </div>
    </section>
  );
}
