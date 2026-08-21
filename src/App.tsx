import { useEffect, useRef, useState } from "react";
import BlurText from "./components/BlurText";
import StatsSection from "./components/StatsSection";
import ServicesSection from "./components/ServicesSection";
import RealisationsSection from "./components/RealisationsSection";
import TestimonialsSection from "./components/TestimonialsSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import { SITE_NAVIGATION } from "./data/navigation";
import logoNovacar from "./assets/brand/logo_fondclair.svg";
import heroBackground from "./assets/brand/fond3.png";

export default function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    function handleViewportChange(event: MediaQueryListEvent) {
      if (event.matches) setIsMenuOpen(false);
    }

    const desktopViewport = window.matchMedia("(min-width: 62rem)");
    document.addEventListener("keydown", handleKeyDown);
    desktopViewport.addEventListener("change", handleViewportChange);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      desktopViewport.removeEventListener("change", handleViewportChange);
    };
  }, [isMenuOpen]);

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
            ".nav-links a, .nav-divider",
            {
              y: -8,
              opacity: 0,
              duration: 0.45,
              stagger: 0.06,
            },
            0.04,
          )
          .from(
            ".nav-cta",
            {
              y: -8,
              opacity: 0,
              duration: 0.45,
            },
            0.1,
          )
          .from(
            ".hero-kicker",
            {
              y: 14,
              opacity: 0,
              duration: 0.55,
            },
            0.18,
          )
          .from(
            ".hero-actions, .hero-copy",
            {
              y: 16,
              opacity: 0,
              duration: 0.6,
              stagger: 0.08,
            },
            0.4,
          )
          .from(
            ".hero-media",
            {
              opacity: 0,
              scale: 1.04,
              duration: 0.9,
            },
            0.1,
          );

        const statItems = gsap.utils.toArray<HTMLElement>(".stats-item");
        if (statItems.length) {
          gsap.set(statItems, { autoAlpha: 0, y: 24 });

          ScrollTrigger.create({
            trigger: ".stats",
            start: "top 82%",
            once: true,
            onEnter: () => {
              gsap.to(statItems, {
                autoAlpha: 1,
                y: 0,
                duration: 0.6,
                ease: "expo.out",
                stagger: 0.1,
              });

              statItems.forEach((item) => {
                const valueEl = item.querySelector<HTMLElement>(".stats-value");
                if (!valueEl) return;

                const target = Number(valueEl.dataset.value ?? 0);
                const suffix = valueEl.dataset.suffix ?? "";
                const counter = { value: 0 };

                valueEl.textContent = `0${suffix}`;

                gsap.to(counter, {
                  value: target,
                  duration: 1.4,
                  ease: "power2.out",
                  onUpdate: () => {
                    valueEl.textContent = `${Math.round(counter.value)}${suffix}`;
                  },
                });
              });
            },
          });
        }

        const servicesPanel = document.querySelector<HTMLElement>(".services-panel");
        if (servicesPanel) {
          const servicesHeader = servicesPanel.querySelector<HTMLElement>(".services-header");
          const serviceGroups = gsap.utils.toArray<HTMLElement>(
            ".services-group",
            servicesPanel,
          );
          const servicesCta = servicesPanel.querySelector<HTMLElement>(".services-cta");

          gsap.set(servicesPanel, { autoAlpha: 0, y: 32 });
          if (servicesHeader) gsap.set(servicesHeader, { autoAlpha: 0, y: 18 });

          ScrollTrigger.create({
            trigger: ".services",
            start: "top 82%",
            once: true,
            onEnter: () => {
              const panelTimeline = gsap.timeline({ defaults: { ease: "expo.out" } });
              panelTimeline.to(servicesPanel, {
                autoAlpha: 1,
                y: 0,
                duration: 0.75,
              });

              if (servicesHeader) {
                panelTimeline.to(
                  servicesHeader,
                  { autoAlpha: 1, y: 0, duration: 0.55 },
                  0.18,
                );
              }
            },
          });

          serviceGroups.forEach((group, index) => {
            const serviceCards = gsap.utils.toArray<HTMLElement>(".service-card", group);
            const serviceTag = group.querySelector<HTMLElement>(".services-tag");
            const serviceTagInner = group.querySelector<HTMLElement>(".services-tag-inner");
            const carouselControls = group.querySelector<HTMLElement>(
              ".services-carousel-controls",
            );

            // L'animation d'entrée (fondu + slide) porte sur .services-tag-inner,
            // jamais sur .services-tag lui-même : ce dernier garde son transform
            // CSS statique (translate(-50%, -50%) rotate(180deg)) qui le centre
            // pile sur le bord du panneau. Si GSAP animait x directement sur
            // .services-tag, il écraserait ce transform et le tag se retrouverait
            // décalé entièrement à l'intérieur du panneau une fois l'animation
            // terminée.
            if (serviceTag) {
              gsap.set(serviceTag, { autoAlpha: 0 });
            }
            if (serviceTagInner) {
              gsap.set(serviceTagInner, {
                x: index % 2 === 0 ? -12 : 12,
              });
            }
            gsap.set(serviceCards, { autoAlpha: 0, y: 26, scale: 0.975 });
            if (carouselControls) {
              gsap.set(carouselControls, { autoAlpha: 0, y: 8 });
            }

            ScrollTrigger.create({
              trigger: group,
              start: "top 88%",
              once: true,
              onEnter: () => {
                const groupTimeline = gsap.timeline({ defaults: { ease: "expo.out" } });
                if (serviceTag) {
                  groupTimeline.to(serviceTag, {
                    autoAlpha: 1,
                    duration: 0.5,
                  });
                }
                if (serviceTagInner) {
                  groupTimeline.to(
                    serviceTagInner,
                    {
                      x: 0,
                      duration: 0.5,
                    },
                    "<",
                  );
                }
                groupTimeline.to(
                  serviceCards,
                  {
                    autoAlpha: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.62,
                    stagger: 0.075,
                  },
                  serviceTag ? 0.08 : 0,
                );
                if (carouselControls) {
                  groupTimeline.to(
                    carouselControls,
                    { autoAlpha: 1, y: 0, duration: 0.4 },
                    "-=0.28",
                  );
                }
              },
            });
          });

          if (servicesCta) {
            gsap.set(servicesCta, { autoAlpha: 0, y: 18 });
            ScrollTrigger.create({
              trigger: servicesCta,
              start: "top 92%",
              once: true,
              onEnter: () => {
                gsap.to(servicesCta, {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.6,
                  ease: "expo.out",
                });
              },
            });
          }
        }

        const realisationsHeader = document.querySelector<HTMLElement>(".realisations-header");
        const realisationItems = gsap.utils.toArray<HTMLElement>(".realisation-item");
        if (realisationsHeader || realisationItems.length) {
          if (realisationsHeader) {
            gsap.set(realisationsHeader, { autoAlpha: 0, y: 24 });
          }
          if (realisationItems.length) {
            gsap.set(realisationItems, { autoAlpha: 0, y: 26 });
          }

          ScrollTrigger.create({
            trigger: ".realisations",
            start: "top 82%",
            once: true,
            onEnter: () => {
              const realisationsTimeline = gsap.timeline({ defaults: { ease: "expo.out" } });
              if (realisationsHeader) {
                realisationsTimeline.to(realisationsHeader, {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.6,
                });
              }
              if (realisationItems.length) {
                realisationsTimeline.to(
                  realisationItems,
                  {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                  },
                  realisationsHeader ? "-=0.25" : 0,
                );
              }
            },
          });
        }

        const testimonialsPanel = document.querySelector<HTMLElement>(".testimonials-panel");
        if (testimonialsPanel) {
          const testimonialCards = gsap.utils.toArray<HTMLElement>(".testimonial-card");

          gsap.set(testimonialsPanel, { autoAlpha: 0, y: 40 });
          if (testimonialCards.length) {
            gsap.set(testimonialCards, { autoAlpha: 0, y: 20 });
          }

          ScrollTrigger.create({
            trigger: ".testimonials",
            start: "top 78%",
            once: true,
            onEnter: () => {
              gsap.to(testimonialsPanel, {
                autoAlpha: 1,
                y: 0,
                duration: 0.7,
                ease: "expo.out",
              });

              if (testimonialCards.length) {
                gsap.to(testimonialCards, {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.55,
                  ease: "expo.out",
                  stagger: 0.08,
                  delay: 0.15,
                });
              }
            },
          });
        }

        const contactGrid = document.querySelector<HTMLElement>(".contact-grid");
        if (contactGrid) {
          gsap.set(contactGrid, { autoAlpha: 0, y: 32 });

          ScrollTrigger.create({
            trigger: ".contact",
            start: "top 80%",
            once: true,
            onEnter: () => {
              gsap.to(contactGrid, {
                autoAlpha: 1,
                y: 0,
                duration: 0.65,
                ease: "expo.out",
              });
            },
          });
        }
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
      <a className="skip-link" href="#main-content">
        Aller au contenu principal
      </a>
      <header className={`site-header${isMenuOpen ? " site-header--menu-open" : ""}`}>
        <div className="nav-left">
          <a className="brand" href="#accueil" aria-label="Novacar, accueil">
            <img src={logoNovacar} alt="Novacar" />
          </a>
          <span className="nav-divider" aria-hidden="true" />
          <button
            ref={menuButtonRef}
            type="button"
            className="nav-menu-button"
            aria-controls="main-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
          <nav
            id="main-navigation"
            className={`nav-links${isMenuOpen ? " nav-links--open" : ""}`}
            aria-label="Navigation principale"
          >
            {SITE_NAVIGATION.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
                {item.label}
              </a>
            ))}
            <a className="nav-mobile-cta" href="#contact" onClick={() => setIsMenuOpen(false)}>
              Demander un devis
            </a>
          </nav>
        </div>

        <a className="nav-cta" href="#contact">
          Prendre contact
        </a>
      </header>

      <main id="main-content">
        <section id="accueil" className="hero" aria-labelledby="hero-title">
          <div className="hero-media" aria-hidden="true">
            <img src={heroBackground} alt="" />
          </div>

          <div className="hero-content">
            <p className="hero-kicker">Retouche Jantes &amp; carrosserie en Île-de-France</p>

            <BlurText
              as="h1"
              id="hero-title"
              text="Vos jantes et votre carrosserie, comme sorties d'usine"
              delay={40}
              animateBy="words"
              direction="bottom"
              className="hero-title"
              stepDuration={0.24}
            />

            <p className="hero-copy">
              Rénovation de jantes, retouche peinture et lustrage. Devis
              gratuit, intervention sous 72h en moyenne.
            </p>

            <div className="hero-actions">
              <a className="btn btn-primary" href="#contact">
                Demander un devis
              </a>
              <a className="btn btn-secondary" href="#tarifs">
                Voir les tarifs
              </a>
            </div>
          </div>
        </section>

        <StatsSection />
        <ServicesSection />
        <RealisationsSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
