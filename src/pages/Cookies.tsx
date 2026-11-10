import { useEffect } from "react";
import {
  LegalEssential,
  LegalNote,
  LegalPage,
  LegalSection,
  LegalTable,
  LegalText,
  type TocItem,
} from "../components/legal/LegalKit";
import { CONSENT_KEY, requestReopenConsentBanner } from "../lib/consent";
import { getGa4MeasurementId } from "../lib/analytics";

const TOC: TocItem[] = [
  { id: "definition", label: "Qu’est-ce qu’un cookie ?" },
  { id: "cookies-utilises", label: "Cookies utilisés sur ce site" },
  { id: "services-externes", label: "Services externes sans cookie" },
  { id: "gerer", label: "Gérer vos choix" },
  { id: "evolution", label: "Évolution de cette politique" },
];

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

  const essentiel = [
    {
      label: "Aujourd’hui",
      text: ga4Configured
        ? "Aucun cookie de suivi ou de publicité n’est déposé sans votre accord."
        : "Aucun cookie de suivi ou de publicité n’est déposé sur ce site.",
    },
    {
      label: "Mesure d’audience",
      text: ga4Configured
        ? "Google Analytics 4 est actif uniquement avec votre accord."
        : "Google Analytics est prévu. Il ne s’activera qu’avec votre accord.",
    },
    { label: "Votre choix", text: "Accepter, refuser ou changer d’avis à tout moment, aussi simplement." },
    { label: "Durée de votre choix", text: "Il est conservé 6 mois, puis nous vous le redemandons." },
  ];

  return (
    <LegalPage
      current="cookies"
      title="Politique de cookies"
      breadcrumbLabel="Politique de cookies"
      intro="Les cookies et traceurs utilisés sur ce site, à quoi ils servent et comment modifier vos choix à tout moment, conformément aux recommandations de la CNIL."
      toc={TOC}
      contactTitle="Une question sur les cookies ?"
    >
      <LegalEssential items={essentiel} />

      <LegalSection id="definition" kicker="01" title="Qu’est-ce qu’un cookie ?">
        <LegalText>
          Un cookie est un petit fichier enregistré sur votre appareil quand vous visitez un site.
          Certains sont indispensables au fonctionnement du site, d’autres servent par exemple à
          mesurer l’audience et nécessitent votre accord (article 82 de la loi Informatique et
          Libertés).
        </LegalText>
      </LegalSection>

      <LegalSection id="cookies-utilises" kicker="02" title="Cookies utilisés sur ce site">
        <LegalTable
          caption="Cookies et traceurs utilisés sur le site"
          columns={["Nom", "Catégorie", "Finalité", "Durée", "Statut"]}
          rows={[
            [
              CONSENT_KEY,
              "Nécessaire",
              "Mémorise vos choix sur les cookies (stockage local de votre navigateur)",
              "6 mois",
              ga4Configured ? "Actif" : "Actif quand le bandeau sera en place",
            ],
            [
              "_ga",
              "Mesure d’audience",
              "Distingue les visiteurs (Google Analytics 4)",
              "13 mois max.",
              ga4Configured ? "Actif avec votre accord" : "Prévu, avec votre accord",
            ],
            [
              "_ga_<ID>",
              "Mesure d’audience",
              "Conserve l’état de la session (Google Analytics 4)",
              "13 mois max.",
              ga4Configured ? "Actif avec votre accord" : "Prévu, avec votre accord",
            ],
          ]}
        />
        <LegalNote badge="À confirmer">
          Le nom du choix mémorisé est fixé ({CONSENT_KEY}) ; l’identifiant Google Analytics
          (_ga_&lt;ID&gt;) sera précisé à l’activation de la mesure d’audience.
        </LegalNote>
      </LegalSection>

      <LegalSection id="services-externes" kicker="03" title="Services externes sans cookie">
        <LegalTable
          caption="Services externes qui ne déposent pas de cookie"
          columns={["Service", "Usage", "Ce qui est transmis"]}
          rows={[
            ["Google Fonts", "Affichage des polices du site", "Votre adresse IP à Google"],
            ["Brevo", "Envoi du formulaire de devis par e-mail", "Le contenu du formulaire, au moment de l’envoi"],
          ]}
        />
      </LegalSection>

      <LegalSection id="gerer" kicker="04" title="Gérer vos choix">
        {ga4Configured ? (
          <>
            <LegalText>
              Vous pouvez modifier vos préférences à tout moment avec le bouton ci-dessous ou depuis
              le bouton «&nbsp;Cookies&nbsp;» en bas à gauche de chaque page. Vous pouvez aussi
              bloquer les cookies dans les réglages de votre navigateur.
            </LegalText>
            <button type="button" className="legal-button" onClick={requestReopenConsentBanner}>
              Modifier mes choix
            </button>
          </>
        ) : (
          <LegalText>
            Aucun choix n’est à faire aujourd’hui&nbsp;: le bandeau de consentement n’apparaîtra
            qu’à l’activation de la mesure d’audience. Vous pouvez aussi bloquer les cookies dans
            les réglages de votre navigateur.
          </LegalText>
        )}
      </LegalSection>

      <LegalSection id="evolution" kicker="05" title="Évolution de cette politique">
        <LegalText>
          Si un nouveau traceur est ajouté, par exemple un pixel publicitaire, cette page sera mise
          à jour et le bandeau vous redemandera votre accord.
        </LegalText>
      </LegalSection>
    </LegalPage>
  );
}
