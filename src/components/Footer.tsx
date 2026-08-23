import logoNovacar from "../assets/brand/logo_fondsombre.svg";
import { SITE_NAVIGATION } from "../data/navigation";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer" aria-labelledby="footer-title">
      <div className="footer-main">
        <div className="footer-brand-block">
          <a className="footer-brand" href="/#accueil" aria-label="Novacar, retour à l’accueil">
            <img src={logoNovacar} alt="Novacar" />
            <span className="footer-brand-name">Novacar</span>
          </a>
          <h2 id="footer-title" className="footer-title">
            Retouche de peinture &amp; rénovation de jantes
          </h2>
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
          </ul>
        </nav>

        <div className="footer-contact">
          <p className="footer-column-title">Nous contacter</p>
          <dl>
            <div>
              <dt>Téléphone</dt>
              <dd>
                01 85 10 00 01
              </dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>
                contact@nova-car.fr
              </dd>
            </div>
            <div>
              <dt>Atelier</dt>
              <dd>
                Adresse à compléter — Île-de-France
              </dd>
            </div>
          </dl>
          <p className="footer-social-placeholder">
            Réseaux sociaux
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {currentYear} Novacar. Tous droits réservés.</p>
        <a href="/#accueil">Retour en haut <span aria-hidden="true">↑</span></a>
      </div>
    </footer>
  );
}
