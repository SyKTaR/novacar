import gsap from "gsap";

/**
 * Transitions interactives du parcours de devis. L'état React reste la source de
 * vérité : chaque méthode kill les tweens précédents de ses cibles et nettoie ses
 * styles inline (clearProps) pour qu'un clic rapide ne laisse jamais d'état bloqué.
 * Chargé dynamiquement par QuoteForm (jamais pendant le rendu serveur).
 */
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function createQuoteMotion(card: HTMLElement) {
  const dispatchLayout = () => card.closest(".app-shell")?.dispatchEvent(new Event("novacar:layout"));
  const q = <T extends HTMLElement = HTMLElement>(selector: string, scope: ParentNode = card) =>
    Array.from(scope.querySelectorAll<T>(selector));

  /** Sortie courte dans le sens de la navigation (avant → gauche, retour → droite). */
  function exit(panel: HTMLElement | null, direction: 1 | -1): Promise<void> {
    if (!panel || reduced()) return Promise.resolve();
    gsap.killTweensOf(panel);
    return new Promise((resolve) => {
      gsap.to(panel, {
        opacity: 0,
        x: -22 * direction,
        duration: 0.2,
        ease: "power2.in",
        onComplete: resolve,
        onInterrupt: resolve,
      });
    });
  }

  /** Entrée de l'étape suivante + hauteur de carte animée depuis l'ancienne valeur. */
  function enter(panel: HTMLElement | null, body: HTMLElement | null, direction: 1 | -1, previousHeight: number, slide = true) {
    if (!panel || !body || reduced()) return;
    gsap.killTweensOf([panel, body]);
    const nextHeight = panel.offsetHeight;
    if (slide) {
      gsap.fromTo(
        panel,
        { opacity: 0, x: 30 * direction },
        { opacity: 1, x: 0, duration: 0.5, ease: "expo.out", clearProps: "opacity,transform" },
      );
    }
    if (previousHeight > 0 && Math.abs(previousHeight - nextHeight) > 1) {
      gsap.fromTo(
        body,
        { height: previousHeight, overflow: "hidden" },
        {
          height: nextHeight,
          duration: 0.5,
          ease: "expo.out",
          clearProps: "height,overflow",
          onComplete: dispatchLayout,
          onInterrupt: () => gsap.set(body, { clearProps: "height,overflow" }),
        },
      );
    }
  }

  /** Trait qui se remplit, disque qui pulse, coche qui se dessine. */
  function stepper(from: number, to: number) {
    if (reduced() || from === to) return;
    q(".quote-step-fill").forEach((fill, index) => {
      const line = index + 1; // trait entre l'étape `line` et `line + 1`
      const wasFilled = from > line;
      const isFilled = to > line;
      gsap.killTweensOf(fill);
      if (!wasFilled && isFilled) {
        gsap.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power3.out", delay: 0.12, clearProps: "transform" });
      } else if (wasFilled && !isFilled) {
        gsap.fromTo(fill, { scaleX: 1 }, { scaleX: 0, duration: 0.35, ease: "power3.out", clearProps: "transform" });
      }
    });
    q(".quote-step").forEach((step, index) => {
      const number = index + 1;
      const disc = step.querySelector<HTMLElement>(".quote-step-disc");
      const path = step.querySelector<SVGPathElement>(".quote-step-check .quote-check-path");
      if (path && number < to && number >= from) {
        gsap.killTweensOf(path);
        gsap.fromTo(path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4, ease: "power3.out", delay: 0.1, clearProps: "strokeDashoffset" });
      }
      if (disc && number === to) {
        gsap.killTweensOf(disc);
        gsap.fromTo(disc, { scale: 0.86 }, { scale: 1, duration: 0.45, ease: "expo.out", delay: 0.12, clearProps: "transform" });
      }
    });
  }

  function thumbIn(item: HTMLElement) {
    if (reduced()) return;
    gsap.killTweensOf(item);
    gsap.fromTo(item, { opacity: 0, scale: 0.82 }, { opacity: 1, scale: 1, duration: 0.45, ease: "expo.out", clearProps: "opacity,transform" });
  }

  function thumbOut(item: HTMLElement): Promise<void> {
    if (reduced()) return Promise.resolve();
    gsap.killTweensOf(item);
    return new Promise((resolve) => {
      gsap.to(item, { opacity: 0, scale: 0.8, duration: 0.22, ease: "power3.out", onComplete: resolve, onInterrupt: resolve });
    });
  }

  /** Réaction légère de l'icône d'un besoin sélectionné. */
  function pick(icon: HTMLElement | null) {
    if (!icon || reduced()) return;
    gsap.killTweensOf(icon);
    gsap.fromTo(icon, { scale: 0.82, rotate: -8 }, { scale: 1, rotate: 0, duration: 0.5, ease: "expo.out", clearProps: "transform" });
  }

  /** Disque qui s'ouvre, coche qui se dessine, puis texte et encadré en cascade. */
  function confirm(panel: HTMLElement | null) {
    if (!panel || reduced()) return;
    const disc = panel.querySelector<HTMLElement>(".quote-done-disc");
    const path = panel.querySelector<SVGPathElement>(".quote-check-path");
    const rest = q(".quote-done-title, .quote-done-copy, .quote-done-note, .quote-done-box, .quote-done-home", panel);
    gsap.killTweensOf([disc, path, ...rest]);
    const timeline = gsap.timeline({ defaults: { ease: "expo.out" } });
    if (disc) timeline.fromTo(disc, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, clearProps: "opacity,transform" }, 0);
    if (path) timeline.fromTo(path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, ease: "power3.out", clearProps: "strokeDashoffset" }, 0.28);
    if (rest.length) timeline.fromTo(rest, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, clearProps: "opacity,transform" }, 0.4);
  }

  function destroy() {
    gsap.killTweensOf(card.querySelectorAll("*"));
    gsap.killTweensOf(card);
  }

  return { exit, enter, stepper, thumbIn, thumbOut, pick, confirm, destroy };
}

export type QuoteMotion = ReturnType<typeof createQuoteMotion>;
