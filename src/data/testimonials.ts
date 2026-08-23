export type Testimonial = {
  rating: number;
  quote: string;
  author: string;
  role: string;
};

/**
 * Avis clients — CONTENU FICTIF / PLACEHOLDER.
 *
 * La fiche Google Business de Novacar n'existe pas encore (cf. spec de
 * mission §2). Les 3 avis ci-dessous (texte, notes, noms, statuts) sont
 * inventés par l'agent pour peupler le carrousel dans le style de la
 * maquette Figma fournie par Lucas. Ils ne doivent PAS être publiés tels
 * quels : à remplacer par de vrais avis dès que la fiche Google Business
 * sera créée et alimentée. Voir report.md.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    rating: 5,
    quote:
      "Quatre jantes rayées sur ma Série 3, rendues comme neuves en deux jours. Le raccord de teinte est invisible, même en plein soleil.",
    author: "Julien M.",
    role: "Particulier — Nanterre",
  },
  {
    rating: 5,
    quote:
      "On leur confie les retouches avant mise en vente. Délais tenus, tarifs clairs, et nos véhicules repartent sans trace de choc.",
    author: "Sonia B.",
    role: "Responsable atelier — concession Ouest",
  },
  {
    rating: 5,
    quote:
      "Un élargisseur et une baguette de porte repris le même jour. Devis annoncé, devis respecté. Je n’irai plus ailleurs.",
    author: "Karim D.",
    role: "Particulier — Colombes",
  },
];
