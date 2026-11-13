import type { ReactNode } from "react";

type Pillar = { title: string; text: string; icon: ReactNode; highlight?: boolean };

const svgProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const PILLARS: Pillar[] = [
  {
    title: "Rénovation de jantes",
    text: "Rayures de trottoir, éclats, nouvelle teinte.",
    icon: (
      <svg {...svgProps}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="2.2" />
        <path d="M12 3v6.8M12 14.2V21M3.8 8.2l6.1 2.5M14.1 13.3l6.1 2.5M3.8 15.8l6.1-2.5M14.1 10.7l6.1-2.5" />
      </svg>
    ),
  },
  {
    title: "Peinture & carrosserie",
    text: "Impacts, rayures, rétroviseurs, poignées.",
    icon: (
      <svg {...svgProps}>
        <path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 013 3L8 19l-4 1z" />
        <path d="M14.5 6.5l3 3" />
      </svg>
    ),
  },
  {
    title: "Lustrage",
    text: "Une carrosserie qui retrouve son éclat.",
    icon: (
      <svg {...svgProps}>
        <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z" />
        <path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z" />
      </svg>
    ),
  },
  {
    title: "Retour de leasing",
    text: "Remise à neuf avant l'état des lieux de restitution.",
    highlight: true,
    icon: (
      <svg {...svgProps}>
        <path d="M5 16l1.4-4.6A2 2 0 018.3 10h7.4a2 2 0 011.9 1.4L19 16" />
        <path d="M4 16h16v3H4zM7 19v1.5M17 19v1.5" />
        <circle cx="8" cy="16" r=".6" />
        <circle cx="16" cy="16" r=".6" />
      </svg>
    ),
  },
];

export default function AboutSection() {
  return (
    <section id="qui-sommes-nous" className="about" aria-labelledby="about-title">
      <div className="about-inner">
        <div className="about-copy">
          <p className="about-eyebrow">Qui sommes-nous</p>
          <h2 id="about-title">Réparer l'essentiel, sans tout repeindre</h2>
          <p className="about-lead">
            Novacar remet en état les jantes, la peinture et la carrosserie de votre
            véhicule par retouches localisées : on traite le dommage, pas toute la
            pièce. Nous intervenons à domicile ou en atelier, partout en
            Île-de-France, et préparons aussi les véhicules avant leur restitution de
            fin de leasing.
          </p>

          <ul className="about-pillars">
            {PILLARS.map((pillar) => (
              <li key={pillar.title} className={`about-pillar${pillar.highlight ? " about-pillar--new" : ""}`}>
                <span className="about-pillar-icon">{pillar.icon}</span>
                <div>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.text}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="about-actions">
            <a className="btn btn-primary" href="#contact">
              Demander un devis
            </a>
            <a className="about-link" href="#tarifs">
              Découvrir nos prestations <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="about-visual">
          <iframe
            className="about-visual-frame"
            src="/3d/novacar-scene.html?embed"
            title="Scène 3D : un technicien Novacar intervient sur une voiture"
            loading="lazy"
            scrolling="no"
          />
        </div>
      </div>
    </section>
  );
}
