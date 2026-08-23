import { REALISATIONS } from "../data/realisations";
import BeforeAfterSlider from "./BeforeAfterSlider";

/**
 * Section "Nos réalisations" — comparatifs avant/après à curseur glissant,
 * insérée entre Services/Tarifs et Témoignages.
 *
 * Traitement volontairement différent des panneaux pleins --orange de
 * ServicesSection/TestimonialsSection : fond blanc, séparateurs fins (même
 * logique sobre que StatsSection), pas de carte à badge/bordure colorée.
 * Cela crée aussi une alternance de rythme blanc/orange sur la page plutôt
 * que trois blocs oranges consécutifs.
 *
 * Les paires d’images avant/après et leurs textes alternatifs sont centralisés
 * dans src/data/realisations.ts.
 */
export default function RealisationsSection() {
  return (
    <section id="realisations" className="realisations" aria-labelledby="realisations-title">
      <div className="realisations-inner">
        <header className="realisations-header">
          <p className="realisations-eyebrow">Nos réalisations</p>
          <h2 id="realisations-title" className="realisations-title">
            L’avant/après de nos interventions
          </h2>
          <p className="realisations-intro">
            Trois exemples représentatifs de nos prestations, de l’état initial
            au résultat après intervention.
          </p>
        </header>

        <ul className="realisations-grid" role="list">
          {REALISATIONS.map((realisation) => (
            <li className="realisation-item" key={realisation.id}>
              <p className="realisation-category">{realisation.categoryLabel}</p>
              <h3 className="realisation-name">{realisation.title}</h3>
              <p className="realisation-description">{realisation.description}</p>

              <BeforeAfterSlider realisation={realisation} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
