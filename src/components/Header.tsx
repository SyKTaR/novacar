import { useEffect, useRef, useState } from "react";
import { SITE_NAVIGATION } from "../data/navigation";
import logoNovacar from "../assets/brand/logo-wordmark-blanc.png";
import ThemeToggle from "./ThemeToggle";

/* Libellés propres à la navbar. Le footer continue d'utiliser SITE_NAVIGATION
   tel quel. La page n'a pas de section « Avis » : « FAQ » la remplace. */
const NAV_LABELS: Record<string, string> = {
  "#services": "Prestations",
};

const NAV_ITEMS = SITE_NAVIGATION.map((item) => ({
  href: item.href,
  id: item.href.slice(1),
  label: NAV_LABELS[item.href] ?? item.label,
}));

/** Le lien actif est la dernière ancre (dans l'ordre de la page) dont le haut
 *  est passé sous la ligne de lecture. Aucun lien actif tant qu'on est dans le hero
 *  ou sur une page sans ces ancres (mentions légales, 404).
 *
 *  Sur la page, #tarifs est imbriqué dans #services (quelques dizaines de px
 *  plus bas). Une ancre imbriquée n'est active qu'une fois arrivée sous la
 *  navbar (là où atterrit un clic sur le lien), sinon « Prestations » ne
 *  serait jamais actif. */
function findActiveId(): string | null {
  const line = window.innerHeight * 0.35;
  const elements = NAV_ITEMS.map((item) => document.getElementById(item.id));
  let activeId: string | null = null;
  let activeTop = -Infinity;

  NAV_ITEMS.forEach((item, index) => {
    const element = elements[index];
    if (!element) return;
    const isNested = elements.some((other) => other && other !== element && other.contains(element));
    const limit = isNested
      ? (parseFloat(getComputedStyle(element).scrollMarginTop) || 0) + 12
      : line;
    const top = element.getBoundingClientRect().top;
    if (top <= limit && top > activeTop) {
      activeTop = top;
      activeId = item.id;
    }
  });

  return activeId;
}

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Scroll-spy + état « scrollé », sans dépendance au moteur de scroll :
  // écouteur passif regroupé par requestAnimationFrame.
  useEffect(() => {
    let frame = 0;

    function update() {
      frame = 0;
      setIsScrolled(window.scrollY > 8);
      setActiveId(findActiveId());
    }

    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", schedule);
    };
  }, []);

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
    // Empêche le contenu de défiler derrière le menu mobile/tablette ouvert
    // (panneau sans fond assombri) et suspend le scroll fluide Lenis quand
    // il est présent (page d'accueil uniquement, absent sur les pages légales
    // et si prefers-reduced-motion est actif).
    document.body.classList.toggle("menu-open", isMenuOpen);
    if (isMenuOpen) {
      window.__lenis?.stop();
    } else {
      window.__lenis?.start();
    }

    return () => {
      document.body.classList.remove("menu-open");
      window.__lenis?.start();
    };
  }, [isMenuOpen]);

  const className = [
    "site-header",
    isScrolled ? "site-header--scrolled" : "",
    isMenuOpen ? "site-header--menu-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header
      ref={headerRef}
      className={className}
      onBlur={(event) => {
        // Le focus quitte la navbar (Tab hors du menu ouvert) : on referme.
        const next = event.relatedTarget as Node | null;
        if (isMenuOpen && next && !headerRef.current?.contains(next)) {
          setIsMenuOpen(false);
        }
      }}
    >
      <div className="nb-bar">
        <a className="nb-brand" href="/#accueil" aria-label="Novacar, accueil">
          <img className="nb-logo" src={logoNovacar} alt="Novacar" width={1400} height={199} />
        </a>

        <nav
          id="main-navigation"
          className={`nb-links${isMenuOpen ? " nb-links--open" : ""}`}
          aria-label="Navigation principale"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              className="nb-link"
              href={`/${item.href}`}
              aria-current={activeId === item.id ? "location" : undefined}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a className="nb-mobile-cta" href="/#contact" onClick={() => setIsMenuOpen(false)}>
            Demander un devis
          </a>
        </nav>

        <a className="nb-cta" href="/#contact">
          Devis gratuit
        </a>

        <button
          ref={menuButtonRef}
          type="button"
          className="nb-menu-button"
          aria-controls="main-navigation"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
        {/* Thème sombre uniquement pour le moment (décision Lucas du 2026-09-02) :
            switch masqué, pas supprimé, pour réactivation facile plus tard. */}
        {/* <ThemeToggle /> */}
      </div>
    </header>
  );
}
