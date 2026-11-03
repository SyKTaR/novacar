import { useEffect, useRef, useState } from "react";
import { REALISATIONS, type Realisation } from "../data/realisations";
import Photo from "./Photo";

const PHOTO_SIZES = "(min-width: 62rem) 30vw, 77vw";

function RealisationCard({ realisation, index }: { realisation: Realisation; index: number }) {
  const [isAfter, setIsAfter] = useState(false);
  const interacted = useRef(false);
  const discovered = useRef(false);
  const cardRef = useRef<HTMLLIElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const layer = afterRef.current;
    const thumb = thumbRef.current;
    if (!layer || !thumb) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import("../motion/realisations").then(({ animateRealisationToggle }) => {
      if (!disposed) cleanup = animateRealisationToggle(layer, thumb, isAfter);
    }).catch(() => {
      if (disposed) return;
      layer.style.clipPath = isAfter ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)";
      thumb.style.transform = isAfter ? "translateX(100%)" : "translateX(0)";
    });
    return () => { disposed = true; cleanup?.(); };
  }, [isAfter]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || discovered.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver === "undefined") return;
    let timer = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || discovered.current) return;
      discovered.current = true;
      observer.disconnect();
      timer = window.setTimeout(() => {
        if (!interacted.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) setIsAfter(true);
      }, 1200 + index * 180);
    }, { threshold: 0.35 });
    observer.observe(card);
    return () => { observer.disconnect(); window.clearTimeout(timer); };
  }, [index]);

  const choose = (after: boolean) => { interacted.current = true; setIsAfter(after); };
  return (
    <li className="realisation-item" ref={cardRef}>
      <div className="realisation-media">
        <div className="realisation-media-layer realisation-media-layer--before" aria-hidden={isAfter}>
          <Photo name={realisation.beforePhoto} alt={realisation.beforeAlt} sizes={PHOTO_SIZES} position={realisation.position} eager={index === 0} />
        </div>
        <div className="realisation-media-layer realisation-media-layer--after" ref={afterRef} style={{ clipPath: "inset(0 100% 0 0)" }} aria-hidden={!isAfter}>
          <Photo name={realisation.afterPhoto} alt={realisation.afterAlt} sizes={PHOTO_SIZES} position={realisation.position} />
        </div>
        <div className="realisation-toggle" role="group" aria-label={`Photos de ${realisation.title}`}>
          <span className={`realisation-toggle-thumb${isAfter ? " realisation-toggle-thumb--after" : ""}`} ref={thumbRef} aria-hidden="true" />
          <button type="button" aria-pressed={!isAfter} onClick={() => choose(false)}>Avant</button>
          <button type="button" aria-pressed={isAfter} onClick={() => choose(true)}>Après</button>
        </div>
      </div>
      <div className="realisation-meta">
        <h3 className="realisation-name">{realisation.title}</h3>
        <span className="realisation-category">{realisation.categoryLabel}</span>
      </div>
      <p className="realisation-description">{realisation.description}</p>
    </li>
  );
}

const INSTAGRAM_URL = "https://www.instagram.com/novacar_smartrepair/";
const INSTAGRAM_LABEL = "Voir toutes les réalisations sur Instagram (nouvel onglet)";

export default function RealisationsSection() {
  const [active, setActive] = useState(0);
  const [perView, setPerView] = useState(1);
  const trackRef = useRef<HTMLUListElement>(null);
  const total = REALISATIONS.length;
  const stops = Math.max(1, total - perView + 1);
  const desktop = perView > 1;

  useEffect(() => {
    const query = window.matchMedia("(min-width: 62rem)");
    const sync = () => setPerView(query.matches ? 3 : 1);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const step = () => {
    const cards = trackRef.current?.children;
    if (!cards || cards.length < 2) return 0;
    return (cards[1] as HTMLElement).offsetLeft - (cards[0] as HTMLElement).offsetLeft;
  };

  const updateActive = () => {
    const track = trackRef.current;
    if (!track) return;
    if (desktop) {
      const unit = step();
      if (!unit) return;
      setActive(Math.min(stops - 1, Math.max(0, Math.round(track.scrollLeft / unit))));
      return;
    }
    // En butée de défilement, la dernière (ou première) carte est la carte active.
    if (track.scrollLeft <= 2) { setActive(0); return; }
    if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 2) { setActive(total - 1); return; }
    const center = track.getBoundingClientRect().left + track.clientWidth / 2;
    const cards = Array.from(track.children) as HTMLElement[];
    let closest = 0;
    let distance = Infinity;
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const delta = Math.abs(rect.left + rect.width / 2 - center);
      if (delta < distance) { closest = i; distance = delta; }
    });
    setActive(closest);
  };

  // Recalage de l'indicateur quand on change de breakpoint.
  useEffect(() => { updateActive(); }, [perView]);

  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const goTo = (index: number) => {
    const track = trackRef.current;
    const target = Math.min(stops - 1, Math.max(0, index));
    if (!track) return;
    if (desktop) {
      track.scrollTo({ left: target * step(), behavior: reduced() ? "instant" : "smooth" });
    } else {
      const card = track.children[target] as HTMLElement | undefined;
      card?.scrollIntoView({ behavior: reduced() ? "instant" : "smooth", block: "nearest", inline: "start" });
    }
    setActive(target);
  };

  return (
    <section id="realisations" className="realisations" aria-labelledby="realisations-title">
      <div className="realisations-inner">
        <header className="realisations-header">
          <h2 id="realisations-title" className="realisations-title">Nos réalisations</h2>
          <p className="realisations-intro"><span className="realisations-intro-desktop">Touchez « Avant » ou « Après » pour voir la différence.</span><span className="realisations-intro-mobile">Faites défiler, puis touchez « Avant » ou « Après ».</span></p>
          <a className="realisations-more realisations-more--desktop" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label={INSTAGRAM_LABEL}>
            Voir toutes les réalisations
          </a>
        </header>
        <ul className="realisations-grid" ref={trackRef} onScroll={updateActive} aria-label="Réalisations avant et après">
          {REALISATIONS.map((realisation, index) => <RealisationCard realisation={realisation} index={index} key={realisation.id} />)}
        </ul>
        <div className="realisations-controls" aria-label="Navigation des réalisations">
          <div className="realisations-dots">
            {Array.from({ length: stops }, (_, index) => (
              <button
                type="button"
                key={index}
                className={`realisations-dot${active === index ? " is-active" : ""}`}
                aria-label={desktop ? `Afficher les réalisations à partir de la n° ${index + 1}` : `Réalisation ${index + 1} sur ${total}`}
                aria-current={active === index ? "true" : undefined}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
          <span className="realisations-count" aria-live="polite">{active + 1} / {total}</span>
          <div className="realisations-arrows">
            <button type="button" className="realisations-arrow" aria-label="Réalisations précédentes" disabled={active <= 0} onClick={() => goTo(active - 1)}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14.5 6 8.5 12l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" className="realisations-arrow" aria-label="Réalisations suivantes" disabled={active >= stops - 1} onClick={() => goTo(active + 1)}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9.5 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
        <a className="realisations-more realisations-more--mobile" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label={INSTAGRAM_LABEL}>
          Voir toutes les réalisations
        </a>
      </div>
    </section>
  );
}
