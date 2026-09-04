import { PARTNER_LOGO_PLACEHOLDERS } from "../data/partners";

/**
 * Emplacements de logos strictement temporaires : aucun nom ni logo réel
 * n'est simulé avant la réception des éléments officiels des partenaires.
 */
export default function PartnersSection() {
  return (
    <section id="partenaires" className="partners" aria-labelledby="partners-title">
      <div className="partners-inner">
        <header className="partners-header">
          <p className="partners-eyebrow">Partenaires</p>
          <h2 id="partners-title" className="partners-title">
            Nos partenaires
          </h2>
          <p className="partners-intro">
            Les partenaires qui accompagnent Novacar seront présentés ici prochainement.
          </p>
        </header>

        <ul className="partners-grid" role="list" aria-label="Logos partenaires à venir">
          {PARTNER_LOGO_PLACEHOLDERS.map((partner) => (
            <li className="partner-placeholder" key={partner.id}>
              <span className="partner-placeholder-index" aria-hidden="true">
                {partner.id.slice(-2)}
              </span>
              <span className="partner-placeholder-name">{partner.placeholderLabel}</span>
              {partner.isPlaceholder ? (
                <span className="partner-placeholder-status">Logo à venir</span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
