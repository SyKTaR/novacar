export type NeedId = "jantes" | "carrosserie" | "lustrage" | "inconnu";

export const NEEDS: ReadonlyArray<{
  id: NeedId;
  label: string;
  hint: string;
}> = [
  { id: "jantes", label: "Jantes", hint: "Rayures, éclats, changement de teinte" },
  { id: "carrosserie", label: "Carrosserie", hint: "Impact, rayure, rétroviseur, baguette" },
  { id: "lustrage", label: "Lustrage et optiques", hint: "Peinture ternie, phares jaunis" },
  { id: "inconnu", label: "Je ne sais pas", hint: "On vous conseille sur photo" },
];

export const STEP_LABELS = ["Votre besoin", "Photos et véhicule", "Vos coordonnées"] as const;

export const MAX_PHOTOS = 4;
export const MAX_INPUT_BYTES = 12 * 1024 * 1024;
export const PHONE_DISPLAY = "01 85 10 00 01";
export const PHONE_HREF = "tel:+33185100001";

export function photoCount(n: number) {
  return `${n} photo${n > 1 ? "s" : ""}`;
}

export function needLabel(id: NeedId | null) {
  return NEEDS.find((need) => need.id === id)?.label ?? "";
}

/** « Jantes, 2 photos, Peugeot 3008 » — les éléments vides sont omis. */
export function buildRecap(need: NeedId | null, photos: number, vehicle: string) {
  return [needLabel(need), photos > 0 ? photoCount(photos) : "", vehicle.trim()]
    .filter(Boolean)
    .join(", ");
}
