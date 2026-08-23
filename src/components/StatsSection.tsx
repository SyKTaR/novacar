export type Stat = {
  value: number;
  suffix?: string;
  label: string;
};

/**
 * Chiffres placeholders fournis par la maquette de référence
 * (reference/target-look.png). À valider avec Lucas / le client
 * avant mise en ligne définitive.
 */
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
    suffix: " h",
    label: "Délai moyen d’intervention",
  },
  {
    value: 2500,
    label: "Jantes & éléments de carrosserie rénovés",
  },
];

export default function StatsSection() {
  return (
    <section className="stats" aria-labelledby="stats-title">
      <h2 id="stats-title" className="sr-only">
        Novacar en chiffres
      </h2>

      <ul className="stats-grid">
        {STATS.map((stat) => (
          <li className="stats-item" key={stat.label}>
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
