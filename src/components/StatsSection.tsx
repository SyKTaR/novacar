export type Stat = {
  value: number;
  suffix?: string;
  label: string;
};

/** Chiffres déjà présents dans le projet ; validation commerciale avant publication. */
export const STATS: Stat[] = [
  {
    value: 1000,
    label: "Véhicules pris en charge",
  },
  {
    value: 98,
    suffix: "%",
    label: "Clients satisfaits",
  },
  {
    value: 72,
    suffix: "H",
    label: "Délai moyen d’intervention",
  },
  {
    value: 2500,
    label: "Jantes et éléments de carrosserie rénovés",
  },
];

export default function StatsSection() {
  return (
    <section className="stats" aria-labelledby="stats-title">
      <h2 id="stats-title" className="sr-only">
        Novacar en chiffres
      </h2>

      <ul className="stats-grid">
        {STATS.map((stat, index) => (
          <li className="stats-item" key={stat.label}>
            {index > 0 && <span className="stats-divider" aria-hidden="true" />}
            {index > 1 && <span className="stats-row-divider" aria-hidden="true" />}
            <p
              className="stats-value"
              data-value={stat.value}
              data-suffix={stat.suffix ?? ""}
            >
              {stat.value}
              {stat.suffix ?? ""}
            </p>
            <p className="stats-label">{stat.label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
