import { useEffect, useRef, useState } from "react";
import { FAQ_ITEMS } from "../data/faq";

type Gsap = typeof import("gsap").default;

export default function SeoContentSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const openIndexRef = useRef(0);
  const panels = useRef<Array<HTMLDivElement | null>>([]);
  const motion = useRef<Gsap | null>(null);

  useEffect(() => {
    let mounted = true;
    void import("gsap").then(({ default: gsap }) => { if (mounted) motion.current = gsap; }).catch(() => {
      // L’accordéon reste utilisable sans amélioration animée.
    });
    return () => {
      mounted = false;
      const gsap = motion.current;
      panels.current.forEach((panel) => { if (panel && gsap) gsap.killTweensOf(panel); });
      motion.current = null;
    };
  }, []);

  const open = (index: number) => {
    const previous = openIndexRef.current;
    if (previous === index) return;
    const closing = panels.current[previous];
    const opening = panels.current[index];
    if (!closing || !opening) return;
    const gsap = motion.current;

    gsap?.killTweensOf([closing, opening]);
    const closingHeight = closing.getBoundingClientRect().height;
    const closingOpacity = Number(getComputedStyle(closing).opacity);
    const openingHeight = opening.scrollHeight;
    const openingStart = opening.getBoundingClientRect().height;
    const openingOpacity = Number(getComputedStyle(opening).opacity);
    const refreshLayout = () => opening.closest(".app-shell")?.dispatchEvent(new Event("novacar:layout"));
    openIndexRef.current = index;
    setOpenIndex(index);

    if (!gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      Object.assign(closing.style, { height: "0px", opacity: "0", visibility: "hidden" });
      Object.assign(opening.style, { height: "auto", opacity: "1", visibility: "visible" });
      refreshLayout();
      return;
    }

    gsap.fromTo(closing, { height: closingHeight, opacity: closingOpacity }, {
      height: 0, opacity: 0, duration: 0.42, ease: "power3.out",
      onComplete: () => gsap.set(closing, { visibility: "hidden" }),
    });
    gsap.fromTo(opening, { height: openingStart, opacity: openingOpacity, visibility: "visible" }, {
      height: openingHeight, opacity: 1, duration: 0.48, ease: "expo.out",
      onComplete: () => { gsap.set(opening, { height: "auto" }); refreshLayout(); },
    });
  };

  return (
    <div className="local-seo-content">
      <section id="faq" className="faq" aria-labelledby="faq-title">
        <header className="faq-header">
          <h2 id="faq-title" className="faq-title">Questions fréquentes</h2>
          <p className="faq-intro">Tout ce qu’il faut savoir avant de demander un devis.</p>
        </header>
        <div className="faq-list">
          {FAQ_ITEMS.map((item, index) => (
            <article className="faq-item" key={item.question}>
              <h3 className="faq-question">
                <button className="faq-toggle" type="button" id={`faq-question-${index}`} aria-expanded={openIndex === index} aria-controls={`faq-answer-${index}`} onClick={() => open(index)}>
                  <span>{item.question}</span>
                  <span className="faq-icon" aria-hidden="true"><span className="faq-icon-horizontal" /><span className="faq-icon-vertical" /></span>
                </button>
              </h3>
              <div className="faq-answer" id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-question-${index}`} aria-hidden={openIndex !== index} ref={(node) => { panels.current[index] = node; }}>
                <p>{item.answer}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="faq-cta">
          <p>Vous ne trouvez pas votre réponse ?</p>
          <a href="tel:+33185100001">Nous appeler</a>
        </div>
      </section>
    </div>
  );
}
