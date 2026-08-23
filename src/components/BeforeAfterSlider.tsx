import { useId, useState } from "react";
import type { Realisation } from "../data/realisations";

type BeforeAfterSliderProps = {
  realisation: Realisation;
};

/**
 * Comparatif avant/après à curseur glissant, sans librairie externe.
 *
 * L'interaction repose sur un unique <input type="range"> superposé à la
 * zone image : c'est le moyen le plus simple d'obtenir gratuitement le
 * support clavier (flèches, Home/End), tactile (drag doigt) et souris avec
 * une seule piste de code, plutôt que de réimplémenter la gestion des
 * pointer events pour chaque mode. Le curseur pilote un clip-path sur le
 * calque "après", qui révèle progressivement la photo après par-dessus la
 * photo avant.
 */
export default function BeforeAfterSlider({ realisation }: BeforeAfterSliderProps) {
  const [percent, setPercent] = useState(50);
  const inputId = useId();

  const { title, beforeImage, afterImage, beforeAlt, afterAlt } = realisation;

  return (
    <div className="realisation-media-wrap">
      <div className="realisation-media">
        <div className="realisation-media-layer realisation-media-layer--before">
          {beforeImage ? (
            <img src={beforeImage} alt={beforeAlt} />
          ) : (
            <span className="realisation-media-placeholder-text">Photo avant à venir</span>
          )}
          <span className="realisation-media-tag">Avant</span>
        </div>

        <div
          className="realisation-media-layer realisation-media-layer--after"
          style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}
        >
          {afterImage ? (
            <img src={afterImage} alt={afterAlt} />
          ) : (
            <span className="realisation-media-placeholder-text">Photo après à venir</span>
          )}
          <span className="realisation-media-tag realisation-media-tag--after">Après</span>
        </div>

        <input
          id={inputId}
          type="range"
          className="realisation-slider-input"
          min={0}
          max={100}
          step={1}
          value={percent}
          onChange={(event) => setPercent(Number(event.target.value))}
          aria-label={`Curseur avant/après — ${title}`}
          aria-valuetext={`${percent}% de la photo après révélée`}
        />

        <div className="realisation-divider" style={{ left: `${percent}%` }} aria-hidden="true">
          <span className="realisation-divider-handle">
            <span>‹</span>
            <span>›</span>
          </span>
        </div>
      </div>
    </div>
  );
}
