import { useEffect } from "react";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  LegalInfoList,
  LegalLinkCards,
  LegalPage,
  LegalSection,
  LegalText,
  type InfoRow,
  type TocItem,
} from "../components/legal/LegalKit";

const TOC: TocItem[] = [
  { id: "editeur", label: "Éditeur du site" },
  { id: "hebergement", label: "Hébergement" },
  { id: "propriete", label: "Propriété intellectuelle" },
  { id: "donnees", label: "Données personnelles et cookies" },
];

const EDITEUR_ROWS: InfoRow[] = [
  { label: "Nom commercial", value: "Novacar" },
  { label: "Forme juridique", value: "Société à responsabilité limitée (SARL)" },
  { label: "Capital social", value: "10 000 €" },
  { label: "Siège social", value: "45 allée de Chavannes, 93220 Gagny" },
  { label: "SIRET", value: "105 640 007 00016" },
  { label: "RCS ou RM", value: "SIREN 105 640 007", badge: "Greffe à confirmer", hint: "Ville du greffe du RCS" },
  { label: "TVA intracommunautaire", value: "FR81105640007" },
  { label: "Directeur de la publication", badge: "À compléter", hint: "Nom et prénom (l’un des gérants : Franck Roux ou Clement Soudry)" },
  { label: "Téléphone", value: CONTACT_PHONE },
  { label: "E-mail", value: CONTACT_EMAIL },
];

const HEBERGEUR_ROWS: InfoRow[] = [
  { label: "Hébergeur", value: "Vercel Inc." },
  { label: "Adresse", value: "440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis" },
  { label: "Site web", value: <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a> },
];

export default function MentionsLegales() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Mentions légales | Novacar";
    window.scrollTo(0, 0);
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <LegalPage
      current="mentions"
      title="Mentions légales"
      breadcrumbLabel="Mentions légales"
      intro="Qui édite ce site, qui l’héberge et comment utiliser son contenu, conformément à la loi pour la confiance dans l’économie numérique (LCEN)."
      toc={TOC}
      contactTitle="Une question sur cette page ?"
    >
      <LegalSection id="editeur" kicker="Article 1" title="Éditeur du site">
        <LegalText>
          Conformément aux articles 6-III et 19 de la loi n° 2004-575 du 21 juin 2004 (LCEN),
          voici l’identité de l’éditeur du site Novacar.
        </LegalText>
        <LegalInfoList rows={EDITEUR_ROWS} />
      </LegalSection>

      <LegalSection id="hebergement" kicker="Article 2" title="Hébergement">
        <LegalText>Coordonnées de l’hébergeur du site, conformément à la LCEN.</LegalText>
        <LegalInfoList rows={HEBERGEUR_ROWS} />
      </LegalSection>

      <LegalSection id="propriete" kicker="Article 3" title="Propriété intellectuelle">
        <LegalText>
          Les contenus de ce site (textes, photos, logos, mise en page) appartiennent à Novacar ou
          à ses partenaires, sauf mention contraire. Toute reproduction, représentation ou
          diffusion, même partielle, sans autorisation écrite est interdite.
        </LegalText>
      </LegalSection>

      <LegalSection id="donnees" kicker="Article 4" title="Données personnelles et cookies">
        <LegalText>
          Le traitement des données envoyées par le formulaire de devis et l’usage des cookies sont
          détaillés sur deux pages dédiées.
        </LegalText>
        <LegalLinkCards
          items={[
            {
              href: "/politique-confidentialite",
              title: "Politique de confidentialité",
              text: "Vos données, leur usage et vos droits",
            },
            {
              href: "/cookies",
              title: "Politique de cookies",
              text: "Les traceurs utilisés sur ce site",
            },
          ]}
        />
      </LegalSection>
    </LegalPage>
  );
}
