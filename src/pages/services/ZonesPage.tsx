import { DEPARTMENTS, ZONES_PAGE, ZONES_RELATED_SERVICES, SEO_PAGE_PATHS } from "../../data/seoPages";
import { Breadcrumb, Faq, PageShell, RelatedLinks, Steps } from "./shared";

export default function ZonesPage() {
  return (
    <PageShell title={ZONES_PAGE.metaTitle}>
      <section className="sp-hero" aria-labelledby="sp-title">
        <div className="sp-hero-inner">
          <div className="sp-hero-copy">
            <Breadcrumb label={ZONES_PAGE.navLabel} />
            <p className="sp-eyebrow">{ZONES_PAGE.eyebrow}</p>
            <h1 id="sp-title">{ZONES_PAGE.h1}</h1>
            {ZONES_PAGE.intro.map((paragraph) => (
              <p className="sp-lead" key={paragraph}>
                {paragraph}
              </p>
            ))}
            <div className="sp-actions">
              <a className="btn btn-primary" href="/#contact">
                Demander un devis
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="sp-section" aria-labelledby="sp-dept-title">
        <div className="sp-section-head">
          <h2 id="sp-dept-title">{ZONES_PAGE.departmentsTitle}</h2>
          <p>{ZONES_PAGE.departmentsIntro}</p>
        </div>
        <div className="sp-section-body">
          <ul className="sp-dept-list">
            {DEPARTMENTS.map((department) => (
              <li key={department.code}>
                <span className="sp-dept-code">{department.code}</span>
                <span className="sp-dept-name">{department.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sp-section" aria-labelledby="sp-mode-title">
        <div className="sp-section-head">
          <h2 id="sp-mode-title">{ZONES_PAGE.modeTitle}</h2>
        </div>
        <div className="sp-section-body sp-prose">
          {ZONES_PAGE.modeText.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="sp-section" aria-labelledby="sp-services-title">
        <div className="sp-section-head">
          <h2 id="sp-services-title">{ZONES_PAGE.servicesTitle}</h2>
        </div>
        <div className="sp-section-body">
          <ul className="sp-price-list">
            {ZONES_RELATED_SERVICES.map((service) => (
              <li key={service.path} className="sp-price-row">
                <div className="sp-price-copy">
                  <h3>
                    <a href={service.path}>{service.label}</a>
                  </h3>
                </div>
                <p className="sp-price">{service.from}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Steps id="sp-steps" title={ZONES_PAGE.stepsTitle} steps={ZONES_PAGE.steps} outro={ZONES_PAGE.stepsOutro} />
      <Faq id="sp-faq" title={ZONES_PAGE.faqTitle} items={ZONES_PAGE.faq} />

      <div className="sp-section sp-section--end">
        <RelatedLinks keys={["jantes", "peinture", "lustrage"] as Array<keyof typeof SEO_PAGE_PATHS>} />
      </div>
    </PageShell>
  );
}
