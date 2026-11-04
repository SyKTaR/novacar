import logoNovacar from "../assets/brand/logo-wordmark-blanc.png";
import { SITE_NAVIGATION } from "../data/navigation";
import { requestReopenConsentBanner } from "../lib/consent";
import { getGa4MeasurementId } from "../lib/analytics";
import { SERVICE_PAGE_LIST, ZONES_PAGE } from "../data/seoPages";

const SERVICE_LINKS = [
  ...SERVICE_PAGE_LIST.map((page) => ({ path: page.path, label: page.navLabel })),
  { path: ZONES_PAGE.path, label: ZONES_PAGE.navLabel },
];

const LEGAL_LINKS = [
  { path: "/mentions-legales", label: "Mentions légales" },
  { path: "/politique-confidentialite", label: "Politique de confidentialité" },
  { path: "/cookies", label: "Politique de cookies" },
];

function PhoneIcon() {
  return (
    <svg className="footer-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M5 4h3.5l1.7 4.3-2.2 1.4a11 11 0 0 0 6.3 6.3l1.4-2.2L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5A15.5 15.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CookieIcon() {
  return (
    <svg className="footer-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-4-4 4 4 0 0 1-4-4 1 1 0 0 0-1-1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="8.5" cy="11" r="1.1" fill="currentColor" />
      <circle cx="12.5" cy="15.5" r="1.1" fill="currentColor" />
      <circle cx="15.5" cy="12" r="0.9" fill="currentColor" />
    </svg>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const ga4Configured = Boolean(getGa4MeasurementId());

  return (
    <footer className={ga4Configured ? "site-footer site-footer--reminder" : "site-footer"}>
      <div className="footer-main">
        <div className="footer-brand-block">
          <a className="footer-brand" href="/#accueil" aria-label="Novacar, retour à l’accueil">
            <img src={logoNovacar} alt="Novacar" width="1400" height="199" />
          </a>
          <p className="footer-brand-copy">
            Retouche de peinture et rénovation de jantes, en atelier ou en intervention mobile en
            Île-de-France.
          </p>
        </div>

        <nav className="footer-col" aria-labelledby="footer-nav-label">
          <p className="footer-label" id="footer-nav-label">
            Navigation
          </p>
          <ul className="footer-list">
            {SITE_NAVIGATION.map((item) => (
              <li key={item.href}>
                <a href={`/${item.href}`}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="footer-col" aria-labelledby="footer-services-label">
          <p className="footer-label" id="footer-services-label">
            Prestations
          </p>
          <ul className="footer-list">
            {SERVICE_LINKS.map((link) => (
              <li key={link.path}>
                <a href={link.path}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer-col footer-contact">
          <p className="footer-label">Intervention</p>
          <a className="footer-phone" href="tel:+33185100001">
            <PhoneIcon />
            <span>01 85 10 00 01</span>
          </a>
          <p className="footer-zone">Paris et Île-de-France</p>
          <a className="btn btn-primary footer-cta" href="/#contact">
            Demander un devis
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">© {currentYear} Novacar. Tous droits réservés.</p>
        <nav aria-label="Informations légales">
          <ul className="footer-legal">
            {LEGAL_LINKS.map((link) => (
              <li key={link.path}>
                <a href={link.path}>{link.label}</a>
              </li>
            ))}
            {ga4Configured && (
              <li>
                <button type="button" className="footer-cookie-button" onClick={requestReopenConsentBanner}>
                  <CookieIcon />
                  <span>Gérer mes cookies</span>
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
