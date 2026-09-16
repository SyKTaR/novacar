import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { requestReopenConsentBanner } from "../lib/consent";
import { getGa4MeasurementId } from "../lib/analytics";

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
  const ga4Configured = Boolean(getGa4MeasurementId());

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Gestion des cookies | Novacar";
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

        <section className="legal-page-content">
          <article className="legal-article" aria-labelledby="legal-etat-title">
            <div className="legal-page-intro">
              <p className="legal-page-eyebrow">État actuel</p>
              {ga4Configured ? (
                <>
                  <h2 id="legal-etat-title">Un traceur soumis à consentement&nbsp;: Google Analytics 4</h2>
                  <p>
                    Le site Novacar utilise Google Analytics 4 pour mesurer sa
                    fréquentation (pages visitées, provenance du trafic). Ce traceur
                    n’est chargé qu’après votre accord explicite via le bandeau affiché
                    lors de votre première visite. Sans accord, aucun script Google
                    Analytics n’est chargé et aucun cookie de mesure n’est déposé.
                  </p>
                </>
              ) : (
                <>
                  <h2 id="legal-etat-title">Aucun cookie soumis à consentement pour le moment</h2>
                  <p>
                    À ce jour, le site Novacar ne dépose aucun cookie de mesure
                    d’audience, de publicité ou de traceur nécessitant votre
                    consentement au sens de l’article 82 de la loi Informatique et
                    Libertés. L’intégration de Google Analytics 4 est en cours de mise
                    en place et n’est pas encore active&nbsp;: le bandeau de consentement
                    n’apparaîtra qu’une fois cette intégration effective.
                  </p>
                </>
              )}
            </div>
          </article>

          {ga4Configured && (
            <article className="legal-article" aria-labelledby="legal-choix-title">
              <div className="legal-page-intro">
                <p className="legal-page-eyebrow">Votre choix</p>
                <h2 id="legal-choix-title">Modifier votre consentement</h2>
                <p>
                  Vous pouvez accepter, refuser ou revenir sur votre choix concernant
                  Google Analytics 4 à tout moment.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ marginTop: "1rem" }}
                  onClick={requestReopenConsentBanner}
                >
                  Gérer mes cookies
                </button>
              </div>
            </article>
          )}

          <article className="legal-article" aria-labelledby="legal-ressources-title">
            <div className="legal-page-intro">
              <p className="legal-page-eyebrow">Ressources externes</p>
              <h2 id="legal-ressources-title">Ce que le site charge malgré tout</h2>
              <p>
                {ga4Configured
                  ? "Deux ressources externes sont utilisées par le site sans dépôt de cookie de suivi, en plus de Google Analytics 4 décrit ci-dessus :"
                  : "Deux ressources externes sont utilisées par le site, sans dépôt de cookie de suivi :"}
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
          </article>

          <article className="legal-article" aria-labelledby="legal-evolution-title">
            <div className="legal-page-intro">
              <p className="legal-page-eyebrow">Évolution</p>
              <h2 id="legal-evolution-title">Si d’autres cookies sont ajoutés</h2>
              <p>
                Si Novacar ajoute un jour un pixel publicitaire ou tout autre traceur
                non strictement nécessaire au fonctionnement du site, cette page sera
                mise à jour et le bandeau de consentement couvrira également ce nouveau
                traceur, avec possibilité d’accepter, de refuser et de retirer son
                consentement à tout moment.
              </p>
            </div>
          </article>
        </section>
      </main>

      <Footer />
    </div>
  );
}
