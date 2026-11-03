import logoNovacar from "../assets/brand/logo_fondsombre.svg";
import { SITE_NAVIGATION } from "../data/navigation";
import { requestReopenConsentBanner } from "../lib/consent";
import { getGa4MeasurementId } from "../lib/analytics";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const ga4Configured = Boolean(getGa4MeasurementId());

  return (
    <footer className="site-footer" aria-labelledby="footer-title">
      <div className="footer-main">
        <div className="footer-brand-block">
          <a className="footer-brand" href="/#accueil" aria-label="Novacar, retour à l’accueil">
            <img src={logoNovacar} alt="Novacar" />
            <span className="footer-brand-name">Novacar</span>
          </a>
          <p id="footer-title" className="footer-title">
            Retouche de peinture &amp; rénovation de jantes
          </p>
          <p className="footer-brand-copy">
            Une remise en état précise, en atelier ou en intervention mobile en Île-de-France.
          </p>
        </div>

        <nav className="footer-navigation" aria-label="Navigation de pied de page">
          <p className="footer-column-title">Navigation</p>
          <ul>
            {SITE_NAVIGATION.map((item) => (
              <li key={item.href}>
                <a href={`/${item.href}`}>{item.label}</a>
              </li>
            ))}
            <li>
              <a href="/mentions-legales">Mentions légales</a>
            </li>
            <li>
              <a href="/politique-confidentialite">Politique de confidentialité</a>
            </li>
            <li>
              <a href="/cookies">Gestion des cookies</a>
            </li>
            {ga4Configured && (
              <li>
                <button
                  type="button"
                  className="footer-cookie-button"
                  onClick={requestReopenConsentBanner}
                >
                  Gérer mes cookies
                </button>
              </li>
            )}
          </ul>
        </nav>

        <div className="footer-contact">
          <p className="footer-column-title">Intervention</p>
          <dl>
            <div>
              <dt>Téléphone</dt>
              <dd>
                <a href="tel:+33185100001">01 85 10 00 01</a>
              </dd>
            </div>
            <div>
              <dt>Zone desservie</dt>
              <dd>Île-de-France</dd>
            </div>
            <div>
              <dt>Demande de devis</dt>
              <dd>
                <a href="/#contact">Accéder au formulaire</a>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {currentYear} Novacar. Tous droits réservés.</p>
        <a href="/#accueil">Retour en haut <span aria-hidden="true">↑</span></a>
      </div>
    </footer>
  );
}
