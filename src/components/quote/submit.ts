import { PHONE_DISPLAY, type NeedId } from "./data";
import { fitPhotosToBudget } from "./image";

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
  | { ok: false; reason: "rate-limited" | "failed" };

const ENDPOINT = "/api/devis";

/** Lit un fichier en base64 brut (sans le préfixe `data:…;base64,`). */
function toBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.readAsDataURL(file);
  });
}

type Attempt = "ok" | "rate-limited" | "failed";

async function post(body: Record<string, unknown>): Promise<Attempt> {
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    if (response.status === 429) return "rate-limited";
    const result = (await response.json().catch(() => null)) as { ok?: boolean } | null;
    return response.ok && result?.ok === true ? "ok" : "failed";
  } catch {
    return "failed";
  }
}

/**
 * Envoi de la demande à `/api/devis` (JSON, photos en base64). Si l'envoi avec
 * photos échoue (corps trop gros, pièce jointe refusée…), on retente une fois sans
 * photos pour ne jamais perdre la demande : `photosDropped` permet alors d'afficher
 * PHOTOS_DROPPED_NOTE.
 */
export async function submitQuote(payload: QuotePayload): Promise<SubmitResult> {
  const { need, vehicle, details, name, phone, email, photos } = payload;
  const base = {
    need,
    vehicle: vehicle.trim(),
    details: details.trim(),
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim(),
    consent: true, // case cochée et validée avant l'envoi
  };

  if (photos.length > 0) {
    let encoded: string[] | null = null;
    try {
      encoded = await Promise.all((await fitPhotosToBudget(photos)).map(toBase64));
    } catch {
      encoded = null; // lecture impossible → envoi sans photos ci-dessous
    }
    if (encoded) {
      const first = await post({ ...base, photos: encoded });
      if (first === "ok") return { ok: true, photosDropped: false };
      if (first === "rate-limited") return { ok: false, reason: "rate-limited" };
    }
    const second = await post({ ...base, photos: [], photosSkipped: photos.length });
    if (second === "ok") return { ok: true, photosDropped: true };
    return { ok: false, reason: second === "rate-limited" ? "rate-limited" : "failed" };
  }

  const only = await post(base);
  if (only === "ok") return { ok: true, photosDropped: false };
  return { ok: false, reason: only === "rate-limited" ? "rate-limited" : "failed" };
}

export const PHOTOS_DROPPED_NOTE = `Vos photos n’ont pas pu être jointes : nous vous les demanderons lors de notre rappel, ou appelez-nous au ${PHONE_DISPLAY}.`;
