import { useEffect, type ReactNode } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import type { FaqItem } from "../../data/faq";
import { SERVICE_PAGES, SEO_PAGE_PATHS, ZONES_PAGE } from "../../data/seoPages";

export function PageShell({ title, children }: { title: string; children: ReactNode }) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    window.scrollTo(0, 0);
    return () => {
      document.title = previousTitle;
    };
  }, [title]);

  return (
    <div className="app-shell sp-page">
      <a className="skip-link" href="#main-content">
        Aller au contenu principal
      </a>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </div>
  );
}

export function Breadcrumb({ label }: { label: string }) {
  return (
    <nav className="sp-breadcrumb" aria-label="Fil d’Ariane">
      <ol>
        <li>
          <a href="/">Accueil</a>
        </li>
        <li aria-current="page">{label}</li>
      </ol>
    </nav>
  );
}

export function Faq({ id, title, items }: { id: string; title: string; items: FaqItem[] }) {
  return (
    <section className="sp-section sp-faq" aria-labelledby={`${id}-title`}>
      <div className="sp-section-head">
        <h2 id={`${id}-title`}>{title}</h2>
      </div>
      <div className="sp-section-body">
        {items.map((item) => (
          <details className="sp-faq-item" key={item.question}>
            <summary>
              <h3>{item.question}</h3>
              <span className="sp-faq-icon" aria-hidden="true" />
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Steps({
  id,
  title,
  steps,
  outro,
}: {
  id: string;
  title: string;
  steps: string[];
  outro: string;
}) {
  return (
    <section id="devis" className="sp-section sp-steps" aria-labelledby={`${id}-title`}>
      <div className="sp-section-head">
        <h2 id={`${id}-title`}>{title}</h2>
      </div>
      <div className="sp-section-body">
        <ol className="sp-steps-list">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="sp-steps-outro">{outro}</p>
        <a className="btn btn-primary sp-cta" href="/#contact">
          Demander un devis gratuit
        </a>
      </div>
    </section>
  );
}

const RELATED_LABEL: Record<keyof typeof SEO_PAGE_PATHS, string> = {
  jantes: SERVICE_PAGES.jantes.navLabel,
  peinture: SERVICE_PAGES.peinture.navLabel,
  lustrage: SERVICE_PAGES.lustrage.navLabel,
  zones: ZONES_PAGE.navLabel,
};

export function RelatedLinks({ keys }: { keys: Array<keyof typeof SEO_PAGE_PATHS> }) {
  return (
    <nav className="sp-related" aria-label="Autres pages Novacar">
      <p className="sp-related-label">À lire aussi</p>
      <ul>
        {keys.map((key) => (
          <li key={key}>
            <a href={SEO_PAGE_PATHS[key]}>
              <span>{RELATED_LABEL[key]}</span>
              <span aria-hidden="true">→</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
