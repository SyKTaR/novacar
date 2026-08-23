import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const EDITEUR_FIELDS = [
  ["Nom commercial", "Novacar"],
  ["Forme juridique", "À compléter — raison sociale et forme juridique (SASU, EURL, auto-entreprise…)"],
  ["Capital social", "À compléter si société à capital (sans objet pour une entreprise individuelle)"],
  ["Adresse du siège social", "À compléter — adresse complète"],
  ["SIRET", "À compléter — numéro SIRET"],
  ["RCS/RM", "À compléter — ville d’immatriculation et numéro"],
  ["N° TVA intracommunautaire", "À compléter si assujetti à la TVA"],
  ["Directeur de la publication", "À compléter — nom et qualité du responsable de publication"],
  ["Téléphone", "01 85 10 00 01"],
  ["E-mail", "contact@nova-car.fr"],
] as const;

const HEBERGEUR_FIELDS = [
  ["Hébergeur", "À compléter — raison sociale de l’hébergeur du site"],
  ["Adresse", "À compléter — adresse de l’hébergeur"],
  ["Téléphone", "À compléter — téléphone de l’hébergeur"],
] as const;

export default function MentionsLegales() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Mentions légales — Novacar";
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
            <h1 id="legal-page-title">Mentions légales</h1>
            <p className="legal-page-summary">
              Conformément aux articles 6-III et 19 de la loi n° 2004-575 du 21 juin 2004
              pour la confiance dans l’économie numérique (LCEN), il est précisé aux
              utilisateurs du site Novacar l’identité des différents intervenants dans le
              cadre de sa réalisation et de son suivi.
            </p>
          </div>
        </section>

        <section className="legal-page-content" aria-labelledby="legal-editeur-title">
          <div className="legal-page-intro">
            <p className="legal-page-eyebrow">Article 1</p>
            <h2 id="legal-editeur-title">Éditeur du site</h2>
            <p>
              Champs réglementaires obligatoires. Les valeurs marquées « à compléter »
              seront remplacées par les informations réelles de Novacar avant mise en ligne
              — aucune donnée n’est publiée sans validation.
            </p>
          </div>

          <dl className="legal-page-list">
            {EDITEUR_FIELDS.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="legal-page-content" aria-labelledby="legal-hebergeur-title">
          <div className="legal-page-intro">
            <p className="legal-page-eyebrow">Article 2</p>
            <h2 id="legal-hebergeur-title">Hébergement</h2>
            <p>Coordonnées de l’hébergeur du site, conformément à la LCEN.</p>
          </div>

          <dl className="legal-page-list">
            {HEBERGEUR_FIELDS.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="legal-page-content" aria-labelledby="legal-pi-title">
          <div className="legal-page-intro">
            <p className="legal-page-eyebrow">Article 3</p>
            <h2 id="legal-pi-title">Propriété intellectuelle</h2>
            <p>
              L’ensemble des éléments du site (textes, images, logos, mise en page) est la
              propriété de Novacar ou de ses partenaires, sauf mention contraire. Toute
              reproduction, représentation ou diffusion, totale ou partielle, sans
              autorisation préalable est interdite.
            </p>
          </div>
        </section>

        <section className="legal-page-content" aria-labelledby="legal-donnees-title">
          <div className="legal-page-intro">
            <p className="legal-page-eyebrow">Article 4</p>
            <h2 id="legal-donnees-title">Données personnelles</h2>
            <p>
              Le traitement des données personnelles collectées via le formulaire de
              contact est détaillé dans la{" "}
              <a href="/politique-confidentialite">politique de confidentialité</a>. Les
              cookies et traceurs éventuellement utilisés sont décrits dans la page de{" "}
              <a href="/cookies">gestion des cookies</a>.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
