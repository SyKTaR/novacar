import { useEffect, useRef } from "react";
import BlurText from "./components/BlurText";

export default function App() {
  const appRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;

    async function setupMotion() {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const [{ default: gsap }, { default: Lenis }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("lenis"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const context = gsap.context(() => {
        if (reduceMotion) return;

        const timeline = gsap.timeline({ defaults: { ease: "expo.out" } });
        timeline
          .from(".brand", {
            y: -12,
            opacity: 0,
            duration: 0.55,
          }, 0)
          .from(
            ".nav-side > *",
            {
              y: -8,
              opacity: 0,
              duration: 0.45,
              stagger: 0.06,
            },
            0.04,
          )
          .from(
            [".hero-badge", ".hero-copy", ".access-bar", ".hero-note"],
            {
              y: 10,
              opacity: 0,
              duration: 0.58,
              stagger: 0.06,
            },
            0.2,
          )
          .from(
            ".signal-tile",
            {
              scale: 0.9,
              opacity: 0,
              filter: "blur(4px)",
              duration: 0.58,
              stagger: 0.07,
            },
            0.34,
          );

        gsap.utils.toArray<HTMLElement>(".signal-tile").forEach((tile, index) => {
          gsap.to(tile, {
            y: index % 2 === 0 ? -7 : 7,
            duration: 4.8 + index * 0.65,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        });

        gsap.from([".section-kicker", ".impact-intro"], {
          y: 24,
          opacity: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: "expo.out",
          scrollTrigger: {
            trigger: ".daily-impact",
            start: "top 72%",
          },
        });

        gsap.utils.toArray<HTMLElement>(".benefit-row").forEach((row, index) => {
          const rowTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: row,
              start: "top 92%",
              end: "top 48%",
              scrub: 0.65,
            },
          });
          const animatedChildren = Array.from(row.children).filter(
            (child) => !child.classList.contains("timeline-connector"),
          );

          rowTimeline
            .fromTo(
              row,
              {
                y: index === 0 ? 28 : 96,
                scale: index === 0 ? 0.995 : 0.975,
                opacity: 0,
              },
              {
                y: 0,
                scale: 1,
                opacity: 1,
                ease: "none",
              },
            )
            .from(
              animatedChildren,
              {
                y: 24,
                opacity: 0,
                stagger: 0.06,
                ease: "none",
              },
              0.12,
            );

          gsap.fromTo(
            row,
            { "--rail-progress": 0 },
            {
              "--rail-progress": 1,
              ease: "none",
              scrollTrigger: {
                trigger: row,
                start: "top 52%",
                end: "bottom 52%",
                scrub: 0.4,
                onUpdate: (self) => {
                  row.classList.toggle(
                    "is-timeline-active",
                    self.progress >= 0.5,
                  );
                },
              },
            },
          );

          const connectorFill = row.querySelector<HTMLElement>(
            ".timeline-connector-fill",
          );

          if (connectorFill) {
            gsap.fromTo(
              connectorFill,
              { scaleY: 0 },
              {
                scaleY: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: row,
                  start: "bottom 52%",
                  end: () =>
                    `+=${window.innerHeight * (window.innerWidth >= 768 ? 0.22 : 0.18)}`,
                  scrub: 0.4,
                },
              },
            );
          }
        });
      }, appRef);

      if (reduceMotion) {
        cleanup = () => context.revert();
        return;
      }

      const lenis = new Lenis({ anchors: true });
      lenis.on("scroll", ScrollTrigger.update);
      const updateLenis = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(updateLenis);
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        gsap.ticker.remove(updateLenis);
        lenis.destroy();
        context.revert();
      };
    }

    void setupMotion();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <div ref={appRef} className="app-shell">
      <header className="site-header">
        <nav className="nav-shell" aria-label="Navigation principale">
          <div className="nav-side nav-side-left">
            <a href="#produit">Produit</a>
            <a href="#methode">Méthode</a>
          </div>

          <a className="brand" href="#accueil" aria-label="KLIC, accueil">
            <span className="brand-symbol" aria-hidden="true">K</span>
            <span>KLIC</span>
          </a>

          <div className="nav-side nav-side-right">
            <a className="login-link" href="#connexion">Se connecter</a>
            <a className="nav-cta" href="#contact">Demander une démo</a>
          </div>
        </nav>
      </header>

      <main id="accueil">
        <section className="hero" aria-labelledby="hero-title">
          <div className="signal-tile tile-plan" role="img" aria-label="Planning de production synchronisé">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path className="chart-baseline" d="M4.5 19h15" />
              <path
                className="chart-trace"
                pathLength="1"
                d="M5 16.5 9 12l3 2.5L19 7"
              />
              <circle className="chart-point" cx="19" cy="7" r="1.45" />
            </svg>
          </div>
          <div className="signal-tile tile-quote" role="img" aria-label="Devis prêt à envoyer">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path className="quote-sheet" d="M7 4.5h7l3 3v12H7z" />
              <path className="quote-fold" d="M14 4.5v3h3" />
              <path className="quote-line quote-line-primary" pathLength="1" d="M9.5 11h5" />
              <path className="quote-line quote-line-secondary" pathLength="1" d="M9.5 14h3.5" />
            </svg>
          </div>
          <div className="signal-tile tile-workshop" role="img" aria-label="Activité de l’atelier suivie en temps réel">
            <span /><span /><span /><span />
          </div>
          <div className="signal-tile tile-delivery" role="img" aria-label="Livraison confirmée">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle className="delivery-ring" cx="12" cy="12" r="8" />
              <path className="delivery-check" pathLength="1" d="m7.5 12.2 3 3 6.4-6.6" />
            </svg>
          </div>

          <div className="hero-content">
            <p className="hero-badge">
              Pensé pour les entrepreneurs qui n'ont pas le temps
            </p>

            <BlurText
              id="hero-title"
              text="Toute votre entreprise. Dans une seule application."
              delay={64}
              animateBy="words"
              direction="bottom"
              className="hero-title"
              stepDuration={0.26}
            />

            <p className="hero-copy">
              Priorités, devis, production, livraisons. Klic rassemble votre
              activité et vous aide à décider, sans changer vos habitudes.
            </p>

            <div className="access-bar" id="contact">
              <span>Découvrez Klic en 15 minutes</span>
              <a href="mailto:bonjour@klic.fr?subject=Demande%20de%20démonstration%20Klic">
                Demander une démo
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M4 10h11M11 6l4 4-4 4" />
                </svg>
              </a>
            </div>

            <p className="hero-note">
              Vos priorités. Vos opérations. Un seul fil.
            </p>
          </div>
        </section>

        <section className="daily-impact" id="produit" aria-labelledby="impact-title">
          <div className="impact-shell">
            <header className="impact-heading">
              <p className="section-kicker">Une journée avec Klic</p>
              <BlurText
                as="h2"
                id="impact-title"
                text={"Moins de choses à retenir.\nPlus d’espace pour avancer."}
                delay={64}
                animateBy="words"
                direction="bottom"
                className="impact-title"
                stepDuration={0.26}
              />
              <p className="impact-intro">
                Sur le terrain, à l’atelier ou chez un client, Klic garde le fil
                de votre activité et vous présente la bonne information au bon moment.
              </p>
            </header>

            <div className="benefit-list">
              <article className="benefit-row">
                <div className="benefit-time">
                  <span>08:10</span>
                  <strong>Décider</strong>
                </div>
                <div className="benefit-copy">
                  <h3>Commencez par ce qui compte vraiment.</h3>
                  <p>
                    Klic rassemble urgences, rendez-vous et tâches en attente pour
                    vous donner une priorité claire dès le début de la journée.
                  </p>
                </div>
                <div className="benefit-visual visual-priorities" aria-hidden="true">
                  <span className="visual-label">Aujourd’hui</span>
                  <div className="priority-line is-active"><i />Rappeler Martin</div>
                  <div className="priority-line"><i />Valider la commande</div>
                  <div className="priority-line"><i />Préparer l’intervention</div>
                </div>
                <span className="timeline-connector" aria-hidden="true">
                  <span className="timeline-connector-fill" />
                </span>
              </article>

              <article className="benefit-row">
                <div className="benefit-time">
                  <span>12:35</span>
                  <strong>Répondre</strong>
                </div>
                <div className="benefit-copy">
                  <h3>Transformez une demande en action.</h3>
                  <p>
                    Un message client devient un devis, une relance ou une tâche,
                    sans recopier l’information d’un outil à l’autre.
                  </p>
                </div>
                <div className="benefit-visual visual-conversation" aria-hidden="true">
                  <div className="message message-client">Le devis est toujours valable&nbsp;?</div>
                  <div className="message message-klic">
                    <span className="mini-k">K</span>
                    Prêt à envoyer. Échéance mise à jour.
                  </div>
                </div>
                <span className="timeline-connector" aria-hidden="true">
                  <span className="timeline-connector-fill" />
                </span>
              </article>

              <article className="benefit-row">
                <div className="benefit-time">
                  <span>17:40</span>
                  <strong>Anticiper</strong>
                </div>
                <div className="benefit-copy">
                  <h3>Terminez sans rien laisser derrière vous.</h3>
                  <p>
                    Klic résume ce qui a avancé, signale ce qui bloque et prépare
                    la suite. Vous fermez votre journée avec l’esprit libre.
                  </p>
                </div>
                <div className="benefit-visual visual-recap" aria-hidden="true">
                  <span className="recap-ring">
                    <svg viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="12" />
                      <path pathLength="1" d="m10.5 16 3.6 3.6 7.6-8" />
                    </svg>
                  </span>
                  <span><strong>Journée à jour</strong>3 actions préparées pour demain</span>
                </div>
              </article>
            </div>

            <footer className="impact-footer">
              <p>Klic ne vous demande pas de mieux gérer. Il vous aide à moins gérer.</p>
              <a href="#contact">Voir Klic en action <span aria-hidden="true">↗</span></a>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}
