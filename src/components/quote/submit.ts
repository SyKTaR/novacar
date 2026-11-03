import { buildRecap, needLabel, photoCount, PHONE_DISPLAY, type NeedId } from "./data";

export interface QuotePayload {
  need: NeedId;
  vehicle: string;
  details: string;
  name: string;
  phone: string;
  email: string;
  photos: File[];
}

export type SubmitResult =
  | { ok: true; photosDropped: boolean }
  | { ok: false; reason: "no-key" | "failed" };

const ENDPOINT = "https://api.web3forms.com/submit";

function buildFormData(accessKey: string, payload: QuotePayload, withPhotos: boolean) {
  const { need, vehicle, details, name, phone, email, photos } = payload;
  const form = new FormData();
  form.append("access_key", accessKey);
  form.append("subject", "Nouvelle demande de devis — Novacar");
  form.append("from_name", "Site Novacar");
  // `name` et `email` sont les champs réservés Web3Forms (expéditeur / réponse).
  form.append("name", name.trim());
  form.append("email", email.trim());
  form.append("Téléphone", phone.trim());
  form.append("Besoin", needLabel(need));
  if (vehicle.trim()) form.append("Véhicule", vehicle.trim());
  if (details.trim()) form.append("Précisions", details.trim());
  form.append("Consentement", "Oui — traitement des données pour la demande de devis");

  const lines = [
    `Besoin : ${needLabel(need)}`,
    `Véhicule : ${vehicle.trim() || "non renseigné"}`,
    `Précisions : ${details.trim() || "non renseignées"}`,
    `Récapitulatif : ${buildRecap(need, photos.length, vehicle)}`,
  ];
  if (photos.length > 0 && !withPhotos) {
    lines.push(
      `${photoCount(photos.length)} ${photos.length > 1 ? "sélectionnées" : "sélectionnée"} par le client mais non ${photos.length > 1 ? "jointes" : "jointe"} (envoi de pièces jointes indisponible).`,
    );
  }
  form.append("message", lines.join("\n"));

  if (withPhotos) {
    photos.forEach((photo, index) => form.append(`photo_${index + 1}`, photo, `photo_${index + 1}.jpg`));
  }
  return form;
}

async function post(body: FormData) {
  try {
    // Pas de Content-Type : le navigateur pose le boundary multipart.
    const response = await fetch(ENDPOINT, { method: "POST", headers: { Accept: "application/json" }, body });
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}

/**
 * Envoi Web3Forms. Les pièces jointes relèvent du plan Pro : si l'envoi avec
 * photos échoue, on retente une fois sans photos pour ne jamais perdre la demande.
 */
export async function submitQuote(payload: QuotePayload): Promise<SubmitResult> {
  const accessKey = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;
  if (!accessKey) return { ok: false, reason: "no-key" };

  const hasPhotos = payload.photos.length > 0;
  if (await post(buildFormData(accessKey, payload, true))) return { ok: true, photosDropped: false };
  if (hasPhotos && (await post(buildFormData(accessKey, payload, false)))) return { ok: true, photosDropped: true };
  return { ok: false, reason: "failed" };
}

export const PHOTOS_DROPPED_NOTE = `Vos photos n’ont pas pu être jointes : envoyez-les-nous au ${PHONE_DISPLAY} ou en répondant à notre e-mail.`;
