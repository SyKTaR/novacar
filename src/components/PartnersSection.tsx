import { PARTNERS, type Partner } from "../data/partners";

function PartnerTile({ partner }: { partner: Partner }) {
  return (
    <li className="partner-tile">
      {partner.logo ? (
        <img src={partner.logo} alt={partner.name ? `Logo ${partner.name}` : "Logo partenaire"} />
      ) : (
        <>
          <svg className="partner-tile-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="currentColor" />
            <circle cx="12" cy="12" r="4" stroke="currentColor" />
          </svg>
          <span className="partner-tile-label"><span className="partner-tile-label-long">Logo partenaire</span><span className="partner-tile-label-short">Logo</span></span>
        </>
      )}
    </li>
  );
}

export default function PartnersSection() {
  const placeholdersOnly = PARTNERS.every((partner) => !partner.logo);
  return (
    <section id="partenaires" className="partners" aria-label="Partenaires">
      <div className="partners-inner">
        <div className="partners-marquee" aria-hidden={placeholdersOnly}>
          <div className="partners-track">
            {[0, 1].map((copy) => (
              <ul className="partners-group" key={copy} aria-hidden={copy === 1}>
                {PARTNERS.map((partner) => <PartnerTile key={`${copy}-${partner.id}`} partner={partner} />)}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
