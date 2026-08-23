import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const RESPONSABLE_FIELDS = [
  ["Responsable du traitement", "Novacar — raison sociale complète à compléter (voir mentions légales)"],
  ["Contact vie privée", "contact@nova-car.fr"],
] as const;

const DONNEES_COLLECTEES = [
  [
    "Formulaire de contact / demande de devis",
    "Nom, prénom, e-mail, téléphone, marque et modèle du véhicule, description du besoin.",
  ],
] as const;

const DESTINATAIRES = [
  [
    "Web3Forms",
    "Prestataire technique utilisé pour l'acheminement des messages du formulaire de contact vers Novacar. Aucune autre diffusion à des tiers.",
  ],
] as const;

export default function PolitiqueConfidentialite() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Politique de confidentialité — Novacar";
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
            <h1 id="legal-page-title">Politique de confidentialité</h1>
            <p className="legal-page-summary">
              Cette page explique, conformément au règlement (UE) 2016/679 (RGPD) et à la
              loi Informatique et Libertés modifiée, quelles données Novacar collecte,
              pourquoi, pendant combien de temps, et comment les faire valoir.
            </p>
          </div>
        </section>

        <section className="legal-page-content" aria-labelledby="legal-responsable-title">
          <div className="legal-page-intro">
            <p className="legal-page-eyebrow">1. Responsable</p>
            <h2 id="legal-responsable-title">Responsable du traitement</h2>
            <p>
              Novacar est responsable du traitement des données personnelles collectées
              via ce site.
            </p>
          </div>

          <dl className="legal-page-list">
            {RESPONSABLE_FIELDS.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="legal-page-content" aria-labelledby="legal-donnees-title">
          <div className="legal-page-intro">
            <p className="legal-page-eyebrow">2. Données collectées</p>
            <h2 id="legal-donnees-title">Quelles données et pour quelle finalité</h2>
            <p>
              Novacar ne collecte que les données transmises volontairement via le
              formulaire de contact du site, dans le but exclusif de répondre aux demandes
              de devis et de contact.
            </p>
          </div>

          <dl className="legal-page-list">
            {DONNEES_COLLECTEES.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="legal-page-content" aria-labelledby="legal-base-title">
          <div className="legal-page-intro">
            <p className="legal-page-eyebrow">3. Base légale</p>
            <h2 id="legal-base-title">Fondement du traitement</h2>
            <p>
              Le traitement repose sur l'exécution de mesures précontractuelles prises à
              la demande de la personne concernée (article 6.1.b du RGPD) : répondre à une
              demande de devis suppose de traiter les informations transmises.
            </p>
          </div>
        </section>

        <section className="legal-page-content" aria-labelledby="legal-destinataires-title">
          <div className="legal-page-intro">
            <p className="legal-page-eyebrow">4. Destinataires</p>
            <h2 id="legal-destinataires-title">Qui a accès aux données</h2>
            <p>
              Les données transmises via le formulaire sont destinées à Novacar et à son
              prestataire technique d'envoi de formulaire.
            </p>
          </div>

          <dl className="legal-page-list">
            {DESTINATAIRES.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="legal-page-content" aria-labelledby="legal-duree-title">
          <div className="legal-page-intro">
            <p className="legal-page-eyebrow">5. Durée de conservation</p>
            <h2 id="legal-duree-title">Combien de temps</h2>
            <p>
              Durée de conservation à confirmer par Novacar — recommandation CNIL usuelle
              pour un contact commercial non suivi d'effet : 3 ans à compter du dernier
              contact.
            </p>
          </div>
        </section>

        <section className="legal-page-content" aria-labelledby="legal-droits-title">
          <div className="legal-page-intro">
            <p className="legal-page-eyebrow">6. Vos droits</p>
            <h2 id="legal-droits-title">Exercer vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification,
              d'effacement, de limitation, d'opposition et de portabilité de vos données.
              Pour les exercer, contactez{" "}
              <a href="mailto:contact@nova-car.fr">contact@nova-car.fr</a>. Vous pouvez
              également introduire une réclamation auprès de la CNIL (
              <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">
                www.cnil.fr
              </a>
              ).
            </p>
          </div>
        </section>

        <section className="legal-page-content" aria-labelledby="legal-tiers-title">
          <div className="legal-page-intro">
            <p className="legal-page-eyebrow">7. Services tiers</p>
            <h2 id="legal-tiers-title">Ressources externes chargées par le site</h2>
            <p>
              Le site charge la police Manrope depuis les serveurs Google Fonts, ce qui
              transmet l'adresse IP du visiteur à Google lors du chargement de la page.
              Aucun cookie n'est déposé par cette ressource. Le détail des cookies et
              traceurs utilisés est disponible sur la page{" "}
              <a href="/cookies">gestion des cookies</a>.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
