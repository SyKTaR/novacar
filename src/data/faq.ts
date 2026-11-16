export type FaqItem = {
  question: string;
  answer: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Intervenez-vous à domicile partout en Île-de-France ?",
    answer:
      "Novacar propose des interventions mobiles à Paris (75) et dans les sept autres départements franciliens : Seine-et-Marne (77), Yvelines (78), Essonne (91), Hauts-de-Seine (92), Seine-Saint-Denis (93), Val-de-Marne (94) et Val-d’Oise (95). La faisabilité de l’intervention est confirmée avec le devis selon le véhicule, les travaux et le lieu.",
  },
  {
    question: "Quelles prestations automobiles réalisez-vous ?",
    answer:
      "Novacar prend en charge la rénovation de jantes, les retouches de peinture localisées sur la carrosserie, la rénovation d’optiques avec vernis, le lustrage et la préparation d’un véhicule avant restitution de leasing. Les prestations disponibles et leurs tarifs sont détaillés sur cette page.",
  },
  {
    question: "Combien coûte une retouche de peinture ou une rénovation de jante ?",
    answer:
      "Le prix dépend du type de jante, de la finition et de l’élément de carrosserie à reprendre. Les tarifs TTC sont présentés comme des prix « à partir de » dans la section prestations ; les jantes avec arrachement, la rénovation d’optiques, le lustrage et les dommages particuliers font l’objet d’un devis. Les packs de restitution leasing (LLD / LOA) ont aussi un prix de départ.",
  },
  {
    question: "Comment obtenir un devis pour mon véhicule ?",
    answer:
      "Envoyez votre demande avec la marque et le modèle du véhicule, une description du dommage et, si possible, une photo nette de la zone à reprendre. Novacar confirme ensuite le tarif et les modalités de l’intervention.",
  },
];
