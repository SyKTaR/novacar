import { useEffect, useRef, useState, type ReactNode } from "react";
import Header from "../Header";
import Footer from "../Footer";

/**
 * Briques réutilisables des pages légales (mentions, confidentialité,
 * cookies) : en-tête, onglets, sommaire sticky avec scrollspy, sections
 * numérotées, fiches, tableaux, badges, tuiles et carte contact.
 */

export type LegalPageId = "mentions" | "confidentialite" | "cookies";

const TABS: { id: LegalPageId; label: string; href: string }[] = [
  { id: "mentions", label: "Mentions légales", href: "/mentions-legales" },
  { id: "confidentialite", label: "Confidentialité", href: "/politique-confidentialite" },
  { id: "cookies", label: "Cookies", href: "/cookies" },
];

export interface TocItem {
  id: string;
  label: string;
}

export const CONTACT_EMAIL = "contact@nova-car.fr";
// Téléphone repris tel quel du site actuel (à confirmer par Lucas, non modifié).
export const CONTACT_PHONE = "01 85 10 00 01";
export const CONTACT_PHONE_HREF = "tel:+33185100001";

/* ---------- Badge ---------- */

export function LegalBadge({ children = "À compléter" }: { children?: ReactNode }) {
  return (
    <span className="legal-badge">
      <span aria-hidden="true" className="legal-badge-dot" />
      {children}
    </span>
  );
}

/* ---------- Sommaire (scrollspy) ---------- */

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.3;
      let current = ids[0];
      for (const id of ids) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= line) current = id;
      }
      // Fin de page : la dernière section devient active même si elle est courte.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = ids[ids.length - 1];
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [ids]);

  return [active, setActive] as const;
}

function LegalToc({ items }: { items: TocItem[] }) {
  const ids = useRef(items.map((item) => item.id)).current;
  const [active, setActive] = useScrollSpy(ids);
  const [open, setOpen] = useState(false);

  return (
    <nav className="legal-toc" aria-label="Sommaire" data-open={open}>
      <button
        type="button"
        className="legal-toc-toggle"
        aria-expanded={open}
        aria-controls="legal-toc-list"
        onClick={() => setOpen((value) => !value)}
      >
        <span>Sommaire</span>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <p className="legal-toc-title" aria-hidden="true">Sommaire</p>
      <ul id="legal-toc-list">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              onClick={() => {
                setActive(item.id);
                setOpen(false);
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ---------- Page ---------- */

interface LegalPageProps {
  current: LegalPageId;
  title: string;
  breadcrumbLabel: string;
  intro: string;
  toc: TocItem[];
  contactTitle: string;
  children: ReactNode;
}

export function LegalPage({
  current,
  title,
  breadcrumbLabel,
  intro,
  toc,
  contactTitle,
  children,
}: LegalPageProps) {
  return (
    <div className="app-shell legal-page">
      <a className="skip-link" href="#legal-main-content">
        Aller au contenu principal
      </a>

      <Header />

      <main id="legal-main-content">
        <header className="legal-hero">
          <div className="legal-wrap">
            <nav className="legal-breadcrumb" aria-label="Fil d’Ariane">
              <ol>
                <li>
                  <a href="/">Accueil</a>
                </li>
                <li aria-current="page">{breadcrumbLabel}</li>
              </ol>
            </nav>
            <h1>{title}</h1>
            <p className="legal-intro">{intro}</p>
            <p className="legal-updated">Mise à jour : novembre 2026</p>

            <nav className="legal-tabs" aria-label="Pages légales">
              <ul>
                {TABS.map((tab) => (
                  <li key={tab.id}>
                    <a href={tab.href} aria-current={tab.id === current ? "page" : undefined}>
                      {tab.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </header>

        <div className="legal-wrap legal-layout">
          <aside className="legal-aside">
            <LegalToc items={toc} />
          </aside>

          <div className="legal-content">
            {children}

            <aside className="legal-contact" aria-labelledby="legal-contact-title">
              <div>
                <h2 id="legal-contact-title" className="legal-card-title">
                  {contactTitle}
                </h2>
                <p>Écrivez-nous, on vous répond rapidement.</p>
              </div>
              <p className="legal-contact-links">
                <a className="legal-contact-mail" href={`mailto:${CONTACT_EMAIL}`}>
                  {CONTACT_EMAIL}
                </a>
                <a href={CONTACT_PHONE_HREF}>{CONTACT_PHONE}</a>
              </p>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ---------- Section numérotée ---------- */

export function LegalSection({
  id,
  kicker,
  title,
  children,
}: {
  id: string;
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="legal-section" aria-labelledby={`${id}-title`}>
      <p className="legal-kicker">{kicker}</p>
      <h2 id={`${id}-title`}>{title}</h2>
      {children}
    </section>
  );
}

export function LegalText({ children }: { children: ReactNode }) {
  return <p className="legal-text">{children}</p>;
}

/* ---------- Fiche (liste de champs) ---------- */

export type InfoRow = {
  label: string;
  value?: ReactNode;
  /** Champ à renseigner : affiche le badge + une indication. */
  badge?: string;
  hint?: string;
};

export function LegalInfoList({ rows }: { rows: InfoRow[] }) {
  return (
    <dl className="legal-info">
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>
            {row.badge ? <LegalBadge>{row.badge}</LegalBadge> : <span className="legal-info-value">{row.value}</span>}
            {row.hint && <span className="legal-info-hint">{row.hint}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- Tableau ---------- */

export function LegalTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="legal-table-wrap" role="region" aria-label={caption} tabIndex={0}>
      <table className="legal-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) =>
                cellIndex === 0 ? (
                  <th key={cellIndex} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={cellIndex}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Note (badge + texte) ---------- */

export function LegalNote({ badge, children }: { badge?: string; children: ReactNode }) {
  return (
    <div className="legal-note">
      {badge && <LegalBadge>{badge}</LegalBadge>}
      <p>{children}</p>
    </div>
  );
}

/* ---------- Pastilles, tuiles, cartes de liens ---------- */

export function LegalChips({ items, label }: { items: string[]; label: string }) {
  return (
    <ul className="legal-chips" aria-label={label}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function LegalTiles({ items }: { items: { title: string; text: string }[] }) {
  return (
    <ul className="legal-tiles">
      {items.map((item) => (
        <li key={item.title}>
          <h3 className="legal-card-title">{item.title}</h3>
          <p>{item.text}</p>
        </li>
      ))}
    </ul>
  );
}

export function LegalLinkCards({
  items,
}: {
  items: { href: string; title: string; text: string }[];
}) {
  return (
    <ul className="legal-linkcards">
      {items.map((item) => (
        <li key={item.href}>
          <a href={item.href}>
            <div>
              <h3 className="legal-card-title">{item.title}</h3>
              <p className="legal-linkcard-text">{item.text}</p>
            </div>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function LegalBullets({ children }: { children: ReactNode }) {
  return <ul className="legal-bullets">{children}</ul>;
}

/* ---------- L'essentiel en 30 secondes ---------- */

export function LegalEssential({ items }: { items: { label: string; text: string }[] }) {
  return (
    <section className="legal-essential" aria-labelledby="legal-essential-title">
      <h2 id="legal-essential-title">L’essentiel en 30 secondes</h2>
      <dl>
        {items.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.text}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
