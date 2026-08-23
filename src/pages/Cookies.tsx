import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const RESOURCES = [
  [
    "Google Fonts (police Manrope)",
    "Ressource externe chargée depuis les serveurs de Google pour l’affichage de la typographie du site. Ne dépose aucun cookie mais transmet l’adresse IP du visiteur à Google.",
  ],
  [
    "Web3Forms",
    "Service tiers utilisé uniquement lors de l’envoi du formulaire de contact, pour acheminer le message à Novacar. Ne dépose aucun cookie de suivi.",
  ],
] as const;

export default function Cookies() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Gestion des cookies — Novacar";
    window.scrollTo(0, 0);

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="app-shell legal-page">
      <a className="skip-link" href="#legal-main-content">
        Aller au contenu principal
      </a>

      <Header />

      <main id="legal-main-content">
        <section className="legal-page-hero" aria-labelledby="legal-page-title">
          <div className="legal-page-hero-inner">
            <p className="legal-page-eyebrow">Informations du site</p>
            <h1 id="legal-page-title">Gestion des cookies</h1>
            <p className="legal-page-summary">
              Conformément aux recommandations de la CNIL sur les cookies et autres
              traceurs, cette page décrit précisément ce que le site Novacar dépose sur
              votre appareil.
            </p>
          </div>
        </section>

        <section className="legal-page-content" aria-labelledby="legal-etat-title">
          <div className="legal-page-intro">
            <p className="legal-page-eyebrow">État actuel</p>
            <h2 id="legal-etat-title">Aucun cookie soumis à consentement</h2>
            <p>
              À ce jour, le site Novacar ne dépose aucun cookie de mesure d’audience, de
              publicité ou de traceur nécessitant votre consentement au sens de l’article
              82 de la loi Informatique et Libertés. Aucun bandeau de consentement n’est
              donc affiché.
            </p>
          </div>
        </section>

        <section className="legal-page-content" aria-labelledby="legal-ressources-title">
          <div className="legal-page-intro">
            <p className="legal-page-eyebrow">Ressources externes</p>
            <h2 id="legal-ressources-title">Ce que le site charge malgré tout</h2>
            <p>
              Deux ressources externes sont utilisées par le site, sans dépôt de cookie de
              suivi&nbsp;:
            </p>
          </div>

          <dl className="legal-page-list">
            {RESOURCES.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="legal-page-content" aria-labelledby="legal-evolution-title">
          <div className="legal-page-intro">
            <p className="legal-page-eyebrow">Évolution</p>
            <h2 id="legal-evolution-title">Si des cookies sont ajoutés</h2>
            <p>
              Si Novacar ajoute un jour un outil de mesure d’audience, un pixel publicitaire
              ou tout autre traceur non strictement nécessaire au fonctionnement du site, un
              bandeau de consentement conforme aux recommandations de la CNIL sera mis en
              place avant leur activation, avec possibilité d’accepter, de refuser et de
              retirer son consentement à tout moment.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
