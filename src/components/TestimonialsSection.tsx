import { useRef } from "react";
import { TESTIMONIALS } from "../data/testimonials";

/**
 * Section "Ce que disent nos clients" — bandeau plein --orange, carrousel
 * de cartes d'avis en scroll-snap natif (même approche que ServiceCarousel,
 * pas de librairie externe).
 *
 * Contenu des avis : voir src/data/testimonials.ts — 3 avis PLACEHOLDER
 * (fiche Google Business pas encore créée), signalés dans report.md.
 */
export default function TestimonialsSection() {
  const trackRef = useRef<HTMLUListElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".testimonial-card");
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
    <section id="avis" className="testimonials" aria-labelledby="testimonials-title">
      <div className="testimonials-panel">
        <h2 id="testimonials-title" className="testimonials-title">
          Ce que disent nos clients
        </h2>

        <ul
          className="testimonials-track"
          ref={trackRef}
          role="list"
          aria-label="Avis clients Novacar"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {TESTIMONIALS.map((testimonial) => (
            <li className="testimonial-card" key={testimonial.author}>
              <div className="testimonial-stars" aria-hidden="true">
                {Array.from({ length: 5 }, (_, index) => (
                  <span
                    key={index}
                    className={
                      index < testimonial.rating
                        ? "testimonial-star testimonial-star--filled"
                        : "testimonial-star"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="sr-only">{testimonial.rating} étoiles sur 5</span>

              <p className="testimonial-quote">{testimonial.quote}</p>

              <div className="testimonial-author">
                <p className="testimonial-author-name">{testimonial.author}</p>
                <p className="testimonial-author-role">{testimonial.role}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="testimonials-controls">
          <button
            type="button"
            className="testimonials-control-btn"
            aria-label="Avis précédent"
            onClick={() => scrollByCard(-1)}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            className="testimonials-control-btn"
            aria-label="Avis suivant"
            onClick={() => scrollByCard(1)}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
