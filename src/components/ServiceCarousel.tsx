import { useRef } from "react";
import type { ServiceItem } from "../data/services";

type ServiceCarouselProps = {
  items: ServiceItem[];
  ariaLabel: string;
};

/**
 * Carrousel horizontal léger (scroll-snap natif + boutons précédent/suivant),
 * sans librairie externe. ~2,2 cartes visibles sur desktop (cf. handoff §5).
 */
export default function ServiceCarousel({ items, ariaLabel }: ServiceCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".service-card");
    if (!card) return;

    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || "0") || 0;
    const amount = (card.offsetWidth + gap) * direction;

    track.scrollBy({ left: amount, behavior: "smooth" });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLUListElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollByCard(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByCard(-1);
    }
  }

  return (
    <div className="services-carousel">
      <ul
        className="services-carousel-track"
        ref={trackRef}
        role="list"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {items.map((item) => (
          <li className="service-card" key={item.title}>
            <div className="service-card-media" aria-hidden="true">
              {item.photo ? (
                <img
                  className="service-card-media-img"
                  src={item.photo}
                  alt=""
                  loading="lazy"
                />
              ) : (
                <span className="service-card-media-caption">Photo à venir</span>
              )}
            </div>
            <div className="service-card-body">
              <p className="service-card-title">
                {item.title}
                {item.isPlaceholder ? (
                  <span className="service-card-placeholder-flag"> (à confirmer)</span>
                ) : null}
              </p>
              {typeof item.price === "number" ? (
                <p className="service-card-price">
                  <span className="service-card-price-prefix">À partir de</span>
                  <span>{item.price}&nbsp;€</span>
                  {item.unit ? <span className="service-card-unit">{item.unit}</span> : null}
                </p>
              ) : (
                <p className="service-card-price service-card-price--quote">
                  {item.price}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="services-carousel-controls">
        <button
          type="button"
          className="services-carousel-btn"
          aria-label={`Voir les tarifs précédents — ${ariaLabel}`}
          onClick={() => scrollByCard(-1)}
        >
          <span aria-hidden="true">‹</span>
        </button>
        <button
          type="button"
          className="services-carousel-btn"
          aria-label={`Voir les tarifs suivants — ${ariaLabel}`}
          onClick={() => scrollByCard(1)}
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </div>
  );
}
