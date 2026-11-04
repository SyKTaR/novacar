import { useEffect } from "react";
import {
  CONTACT_EMAIL,
  LegalBullets,
  LegalChips,
  LegalEssential,
  LegalInfoList,
  LegalNote,
  LegalPage,
  LegalSection,
  LegalTable,
  LegalText,
  LegalTiles,
  type TocItem,
} from "../components/legal/LegalKit";

const TOC: TocItem[] = [
  { id: "responsable", label: "Responsable du traitement" },
  { id: "donnees", label: "Données collectées" },
  { id: "base-legale", label: "Base légale" },
  { id: "destinataires", label: "Destinataires" },
  { id: "conservation", label: "Durée de conservation" },
  { id: "droits", label: "Vos droits" },
  { id: "services-tiers", label: "Services tiers" },
];

const ESSENTIEL = [
  { label: "Ce que nous collectons", text: "Uniquement ce que vous saisissez dans le formulaire de devis." },
  { label: "Pourquoi", text: "Pour répondre à votre demande et vous établir un devis." },
  { label: "Avec qui", text: "Novacar et son service d’envoi de formulaire. Rien n’est revendu." },
  { label: "Vos droits", text: `Accès, rectification, suppression : écrivez à ${CONTACT_EMAIL}.` },
];

const DONNEES = [
  "Nom et prénom",
  "E-mail",
  "Téléphone",
  "Marque et modèle du véhicule",
  "Description du besoin",
  "Photos du dommage",
];

const DROITS = [
  { title: "Accès", text: "Savoir quelles données nous avons sur vous." },
  { title: "Rectification", text: "Corriger une information inexacte." },
  { title: "Effacement", text: "Demander la suppression de vos données." },
  { title: "Opposition", text: "Refuser un traitement de vos données." },
  { title: "Limitation", text: "Geler temporairement un traitement." },
  { title: "Portabilité", text: "Récupérer vos données dans un format lisible." },
];

export default function PolitiqueConfidentialite() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Politique de confidentialité | Novacar";
    window.scrollTo(0, 0);
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <LegalPage
      current="confidentialite"
      title="Politique de confidentialité"
      breadcrumbLabel="Politique de confidentialité"
      intro="Quelles données nous recevons quand vous demandez un devis, pourquoi, combien de temps nous les gardons et comment exercer vos droits (RGPD)."
      toc={TOC}
      contactTitle="Une question sur vos données ?"
    >
      <LegalEssential items={ESSENTIEL} />

      <LegalSection id="responsable" kicker="01" title="Responsable du traitement">
        <LegalText>
          Novacar est responsable du traitement des données personnelles collectées via ce site,
          conformément au règlement (UE) 2016/679 (RGPD) et à la loi Informatique et Libertés.
        </LegalText>
        <LegalInfoList
          rows={[
            { label: "Responsable", value: "Novacar" },
            { label: "Raison sociale", badge: "À compléter", hint: "Voir les mentions légales" },
            {
              label: "Contact vie privée",
              value: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>,
            },
          ]}
        />
      </LegalSection>

      <LegalSection id="donnees" kicker="02" title="Données collectées">
        <LegalText>
          Nous ne collectons que les informations que vous nous envoyez volontairement par le
          formulaire de contact et de demande de devis.
        </LegalText>
        <LegalChips items={DONNEES} label="Données collectées" />
      </LegalSection>

      <LegalSection id="base-legale" kicker="03" title="Base légale">
        <LegalText>
          Le traitement repose sur des mesures précontractuelles prises à votre demande (article
          6.1.b du RGPD)&nbsp;: pour vous établir un devis, nous devons utiliser les informations que
          vous nous transmettez.
        </LegalText>
      </LegalSection>

      <LegalSection id="destinataires" kicker="04" title="Destinataires">
        <LegalTable
          caption="Destinataires des données"
          columns={["Destinataire", "Rôle", "Données reçues"]}
          rows={[
            ["Novacar", "Traite votre demande et vous recontacte", "Toutes les données du formulaire"],
            ["Web3Forms", "Transmet le formulaire à Novacar par e-mail", "Toutes les données du formulaire"],
          ]}
        />
        <LegalText>
          Aucune autre transmission à des tiers n’est prévue. Vos données ne sont ni vendues ni
          utilisées à des fins publicitaires.
        </LegalText>
      </LegalSection>

      <LegalSection id="conservation" kicker="05" title="Durée de conservation">
        <LegalNote badge="À confirmer">
          Durée à confirmer par Novacar. La CNIL recommande 3 ans après le dernier contact pour un
          prospect qui n’a pas donné suite.
        </LegalNote>
      </LegalSection>

      <LegalSection id="droits" kicker="06" title="Vos droits">
        <LegalTiles items={DROITS} />
        <LegalNote>
          Pour exercer ces droits, écrivez à {CONTACT_EMAIL}. Si vous estimez que vos droits ne sont
          pas respectés, vous pouvez saisir la CNIL (
          <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">
            www.cnil.fr
          </a>
          ).
        </LegalNote>
      </LegalSection>

      <LegalSection id="services-tiers" kicker="07" title="Services tiers">
        <LegalBullets>
          <li>
            Les polices du site sont chargées depuis Google Fonts&nbsp;: votre adresse IP est
            transmise à Google. Ce service ne dépose aucun cookie.
          </li>
          <li>
            Le détail des cookies et traceurs est disponible sur la page{" "}
            <a href="/cookies">Politique de cookies</a>.
          </li>
        </LegalBullets>
      </LegalSection>
    </LegalPage>
  );
}
