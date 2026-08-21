import { useEffect } from "react";
import logoNovacar from "../assets/brand/logo_fondclair.svg";

const LEGAL_PLACEHOLDERS = [
  ["Éditeur du site", "Raison sociale et forme juridique — à compléter par Lucas"],
  ["Siège social", "Adresse complète — à compléter par Lucas"],
  ["Immatriculation", "SIRET / RCS — à compléter par Lucas"],
  ["Responsable de publication", "Nom du responsable — à compléter par Lucas"],
  ["Hébergement", "Hébergeur et coordonnées — à compléter par Lucas"],
] as const;

export default function MentionsLegales() {
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Mentions légales — Novacar";
    window.scrollTo(0, 0);

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="legal-page">
      <a className="skip-link" href="#legal-main-content">
        Aller au contenu principal
      </a>

      <header className="legal-page-header">
        <a className="legal-page-brand" href="/" aria-label="Novacar, retour à l’accueil">
          <img src={logoNovacar} alt="Novacar" />
        </a>
        <a className="legal-page-back" href="/">
          <span aria-hidden="true">←</span> Retour à l’accueil
        </a>
      </header>

      <main id="legal-main-content">
        <section className="legal-page-hero" aria-labelledby="legal-page-title">
          <div className="legal-page-hero-inner">
            <p className="legal-page-eyebrow">Informations du site</p>
            <h1 id="legal-page-title">Mentions légales</h1>
            <p className="legal-page-summary">
              Les informations réglementaires de Novacar seront publiées ici après
              validation de leur contenu définitif.
            </p>
          </div>
        </section>

        <section className="legal-page-content" aria-labelledby="legal-details-title">
          <div className="legal-page-intro">
            <p className="legal-page-eyebrow">À finaliser</p>
            <h2 id="legal-details-title">Informations à compléter avant publication</h2>
            <p>
              Les champs ci-dessous reprennent les éléments en attente. Aucune donnée
              légale n’a été ajoutée sans validation.
            </p>
          </div>

          <dl className="legal-page-list">
            {LEGAL_PLACEHOLDERS.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <footer className="legal-page-footer">
        <p>© {currentYear} Novacar. Tous droits réservés.</p>
        <a href="/">Retour à l’accueil</a>
      </footer>
    </div>
  );
}
