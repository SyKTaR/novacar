import { useEffect, useRef, useState } from "react";
import { SITE_NAVIGATION } from "../data/navigation";
import logoNovacar from "../assets/brand/logo_fondclair.svg";

export default function Header() {
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
    // Empêche le contenu de défiler derrière le menu mobile/tablette ouvert
    // (dropdown sans fond assombri) et suspend le scroll fluide Lenis quand
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

  return (
    <header className={`site-header${isMenuOpen ? " site-header--menu-open" : ""}`}>
      <div className="nav-left">
        <a className="brand" href="/#accueil" aria-label="Novacar, accueil">
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
            <a
              key={item.href}
              href={`/${item.href}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a className="nav-mobile-cta" href="/#contact" onClick={() => setIsMenuOpen(false)}>
            Demander un devis
          </a>
        </nav>
      </div>

      <a className="nav-cta" href="/#contact">
        Prendre contact
      </a>
    </header>
  );
}
