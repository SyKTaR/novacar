/**
 * POST /api/devis — réception de la demande de devis et envoi de l'e-mail via
 * l'API transactionnelle Brevo (HTTP). Fonction Vercel (Node), handler « Web »
 * (Request → Response).
 *
 * Variables d'environnement SERVEUR (jamais dans le code, jamais préfixées VITE_) :
 *   BREVO_API_KEY     clé API Brevo
 *   QUOTE_TO_EMAIL    destinataire des demandes
 *   QUOTE_FROM_EMAIL  adresse expéditrice (doit être un expéditeur validé chez Brevo)
 *
 * Fichier volontairement autonome (aucun import depuis src/) : les règles de
 * validation reprennent celles de src/components/quote/validate.ts.
 */

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";
const SENDER_NAME = "Site Novacar";

/** Limite de corps Vercel : 4,5 Mo. On refuse un peu avant. */
const MAX_BODY_BYTES = 4_200_000;
const MAX_PHOTOS = 4;
/** Poids décodé maximal par photo / au total (Brevo : 4 Mo par e-mail → marge). */
const MAX_PHOTO_BYTES = 2_500_000;
const MAX_TOTAL_PHOTO_BYTES = 3_000_000;

const MAX_NAME = 100;
const MAX_VEHICLE = 120;
const MAX_DETAILS = 2000;
const MAX_EMAIL = 254;

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const NEED_LABELS = {
  jantes: "Jantes",
  carrosserie: "Carrosserie",
  lustrage: "Lustrage et optiques",
  inconnu: "Je ne sais pas",
} as const;
type NeedId = keyof typeof NEED_LABELS;

const MESSAGES = {
  method: "Méthode non autorisée.",
  origin: "Origine non autorisée.",
  type: "Format de requête non pris en charge.",
  tooLarge: "La demande est trop volumineuse.",
  invalid: "Les informations transmises sont invalides.",
  photos: "Les photos transmises sont invalides ou trop lourdes.",
  rate: "Trop de demandes. Réessayez dans quelques minutes.",
  server: "L’envoi n’a pas pu être effectué.",
} as const;

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

function json(status: number, body: { ok: true } | { ok: false; error: string }, extra?: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra },
  });
}
const fail = (status: number, error: string, extra?: Record<string, string>) => json(status, { ok: false, error }, extra);

/** Échappe tout texte saisi par le client avant insertion dans le HTML. */
export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Supprime retours à la ligne et caractères de contrôle (en-têtes, sujet). */
const oneLine = (value: string) => value.replace(/[\p{Cc}\p{Zl}\p{Zp}]+/gu, " ").replace(/\s+/g, " ").trim();
/** Texte multiligne : retire uniquement les caractères de contrôle autres que \n et \t. */
const cleanMultiline = (value: string) =>
  value.replace(/\r\n?/g, "\n").replace(/[\p{Cc}\p{Zl}\p{Zp}]/gu, (char) => (char === "\n" || char === "\t" ? char : "")).trim();

export function isAllowedOrigin(origin: string | null) {
  if (!origin) return false;
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }
  if (url.origin !== origin) return false; // refuse chemin, userinfo, etc.
  const host = url.hostname;
  if (url.protocol === "https:") {
    return host === "nova-car.fr" || host === "www.nova-car.fr" || host.endsWith(".vercel.app");
  }
  if (url.protocol === "http:") return host === "localhost" || host === "127.0.0.1";
  return false;
}

/* Limitation de débit best-effort : mémoire de l'instance, non partagée entre instances. */
const hits = new Map<string, number[]>();
export function resetRateLimit() {
  hits.clear();
}
function rateLimited(key: string, now = Date.now()) {
  const recent = (hits.get(key) ?? []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, times] of hits) if (times.every((time) => now - time >= RATE_LIMIT_WINDOW_MS)) hits.delete(k);
  }
  return false;
}
const clientKey = (request: Request) =>
  request.headers.get("x-real-ip")?.trim() ||
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  "inconnu";

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

interface Photo {
  name: string;
  content: string; // base64 (sans préfixe data:)
  bytes: number;
}
interface Quote {
  need: NeedId;
  vehicle: string;
  details: string;
  name: string;
  phone: string;
  email: string;
  photos: Photo[];
  /** Nombre de photos choisies par le client mais non jointes (repli sans photos). */
  photosSkipped: number;
}

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

function decodePhoto(raw: unknown, index: number): Photo | null {
  if (typeof raw !== "string") return null;
  const content = raw.replace(/^data:image\/jpeg;base64,/, "");
  if (content.length < 8 || content.length % 4 !== 0 || !BASE64.test(content)) return null;
  const bytes = Buffer.from(content, "base64");
  // Signature JPEG : FF D8 FF.
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) return null;
  if (bytes.length > MAX_PHOTO_BYTES) return null;
  return { name: `photo-${index + 1}.jpg`, content, bytes: bytes.length };
}

type Parsed = { ok: true; quote: Quote } | { ok: false; kind: "invalid" | "photos" };

export function parseQuote(input: unknown): Parsed {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, kind: "invalid" };
  const data = input as Record<string, unknown>;
  const str = (key: string) => (typeof data[key] === "string" ? (data[key] as string) : null);

  const need = str("need");
  const rawName = str("name");
  const rawPhone = str("phone");
  const rawEmail = str("email");
  if (!need || !(need in NEED_LABELS) || rawName === null || rawPhone === null || rawEmail === null) {
    return { ok: false, kind: "invalid" };
  }
  const rawVehicle = data.vehicle === undefined ? "" : str("vehicle");
  const rawDetails = data.details === undefined ? "" : str("details");
  if (rawVehicle === null || rawDetails === null) return { ok: false, kind: "invalid" };
  if (data.consent !== true) return { ok: false, kind: "invalid" };

  const name = oneLine(rawName);
  const phone = oneLine(rawPhone);
  const email = rawEmail.trim();
  const vehicle = oneLine(rawVehicle);
  const details = cleanMultiline(rawDetails);

  if (name.length < 2 || name.length > MAX_NAME) return { ok: false, kind: "invalid" };
  const digits = phone.replace(/\D/g, "");
  if (!/^\+?[\d\s().-]+$/.test(phone) || digits.length < 10 || digits.length > 15) return { ok: false, kind: "invalid" };
  if (email.length > MAX_EMAIL || !/^[^\s@,;<>"]+@[^\s@,;<>"]+\.[^\s@,;<>"]{2,}$/.test(email)) return { ok: false, kind: "invalid" };
  if (vehicle.length > MAX_VEHICLE || details.length > MAX_DETAILS) return { ok: false, kind: "invalid" };

  const rawPhotos = data.photos === undefined ? [] : data.photos;
  if (!Array.isArray(rawPhotos) || rawPhotos.length > MAX_PHOTOS) return { ok: false, kind: "photos" };
  const photos: Photo[] = [];
  let total = 0;
  for (let i = 0; i < rawPhotos.length; i++) {
    const photo = decodePhoto(rawPhotos[i], i);
    if (!photo) return { ok: false, kind: "photos" };
    total += photo.bytes;
    photos.push(photo);
  }
  if (total > MAX_TOTAL_PHOTO_BYTES) return { ok: false, kind: "photos" };

  let photosSkipped = 0;
  if (data.photosSkipped !== undefined) {
    const skipped = data.photosSkipped;
    if (typeof skipped !== "number" || !Number.isInteger(skipped) || skipped < 0 || skipped > MAX_PHOTOS) {
      return { ok: false, kind: "invalid" };
    }
    photosSkipped = skipped;
  }

  return { ok: true, quote: { need: need as NeedId, vehicle, details, name, phone, email, photos, photosSkipped } };
}

/* ------------------------------------------------------------------ */
/* Contenu de l'e-mail                                                 */
/* ------------------------------------------------------------------ */

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

function skippedLine(quote: Quote) {
  if (quote.photosSkipped === 0) return "";
  return `${plural(quote.photosSkipped, "photo sélectionnée", "photos sélectionnées")} par le client, mais non ${quote.photosSkipped > 1 ? "jointes" : "jointe"} (échec de l’envoi avec pièces jointes). Pensez à les lui demander.`;
}

export function buildSubject(quote: Quote) {
  return oneLine(`Nouvelle demande de devis — ${NEED_LABELS[quote.need]} — ${quote.name}`);
}

export function buildText(quote: Quote) {
  const lines = [
    "Nouvelle demande de devis reçue depuis le site Novacar",
    "",
    `Besoin : ${NEED_LABELS[quote.need]}`,
    `Véhicule : ${quote.vehicle || "non renseigné"}`,
    `Photos jointes : ${quote.photos.length}`,
    "",
    "Précisions :",
    quote.details || "non renseignées",
    "",
    "Coordonnées du client",
    `Nom : ${quote.name}`,
    `Téléphone : ${quote.phone}`,
    `E-mail : ${quote.email}`,
    "",
    "Le client a accepté que ses données soient utilisées pour traiter cette demande.",
    "Vous pouvez répondre directement à cet e-mail pour écrire au client.",
  ];
  const skipped = skippedLine(quote);
  if (skipped) lines.push("", `⚠ ${skipped}`);
  return lines.join("\n");
}

export function buildHtml(quote: Quote) {
  const e = escapeHtml;
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 16px 6px 0;color:#666;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:6px 0;color:#111">${value}</td></tr>`;
  const details = quote.details ? e(quote.details).replace(/\n/g, "<br>") : "<em>non renseignées</em>";
  const skipped = skippedLine(quote);
  return [
    `<!doctype html><html lang="fr"><body style="margin:0;padding:24px;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5">`,
    `<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;padding:24px">`,
    `<h1 style="margin:0 0 4px;font-size:20px;color:#111">Nouvelle demande de devis</h1>`,
    `<p style="margin:0 0 20px;color:#666">Reçue depuis le site Novacar</p>`,
    `<table role="presentation" style="border-collapse:collapse;width:100%">`,
    row("Besoin", e(NEED_LABELS[quote.need])),
    row("Véhicule", quote.vehicle ? e(quote.vehicle) : "<em>non renseigné</em>"),
    row("Photos jointes", String(quote.photos.length)),
    `</table>`,
    `<h2 style="margin:24px 0 8px;font-size:16px;color:#111">Précisions</h2>`,
    `<p style="margin:0;color:#111">${details}</p>`,
    `<h2 style="margin:24px 0 8px;font-size:16px;color:#111">Coordonnées du client</h2>`,
    `<table role="presentation" style="border-collapse:collapse;width:100%">`,
    row("Nom", e(quote.name)),
    row("Téléphone", e(quote.phone)),
    row("E-mail", e(quote.email)),
    `</table>`,
    skipped ? `<p style="margin:20px 0 0;padding:10px 12px;background:#fff4e5;border-radius:6px;color:#7a4300">${e(skipped)}</p>` : "",
    `<p style="margin:24px 0 0;color:#666;font-size:13px">Le client a accepté que ses données soient utilisées pour traiter cette demande. Répondez directement à cet e-mail pour écrire au client.</p>`,
    `</div></body></html>`,
  ].join("");
}

/* ------------------------------------------------------------------ */
/* Envoi Brevo                                                         */
/* ------------------------------------------------------------------ */

interface Config {
  apiKey: string;
  to: string;
  from: string;
}

function readConfig(): Config | null {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const to = process.env.QUOTE_TO_EMAIL?.trim();
  const from = process.env.QUOTE_FROM_EMAIL?.trim();
  const missing = [!apiKey && "BREVO_API_KEY", !to && "QUOTE_TO_EMAIL", !from && "QUOTE_FROM_EMAIL"].filter(Boolean);
  if (missing.length > 0) {
    console.error(`[api/devis] Configuration serveur incomplète, variable(s) manquante(s) : ${missing.join(", ")}`);
    return null;
  }
  return { apiKey: apiKey!, to: to!, from: from! };
}

/**
 * Envoie un e-mail transactionnel. Point d'extension : un accusé de réception au
 * client = un second appel à cette fonction avec `to` = e-mail du client.
 */
async function sendBrevo(config: Config, mail: Record<string, unknown>) {
  const response = await fetch(BREVO_URL, {
    method: "POST",
    headers: { "api-key": config.apiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(mail),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    // Corps d'erreur Brevo : journal serveur uniquement, jamais renvoyé au client.
    const detail = (await response.text().catch(() => "")).slice(0, 500);
    throw new Error(`Brevo HTTP ${response.status} ${detail}`);
  }
}

/* ------------------------------------------------------------------ */
/* Handler                                                             */
/* ------------------------------------------------------------------ */

export async function POST(request: Request): Promise<Response> {
  if (!isAllowedOrigin(request.headers.get("origin"))) return fail(403, MESSAGES.origin);

  const contentType = request.headers.get("content-type") ?? "";
  if (!/^application\/json\b/i.test(contentType)) return fail(415, MESSAGES.type);

  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return fail(413, MESSAGES.tooLarge);

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return fail(400, MESSAGES.invalid);
  }
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) return fail(413, MESSAGES.tooLarge);

  let input: unknown;
  try {
    input = JSON.parse(raw);
  } catch {
    return fail(400, MESSAGES.invalid);
  }

  // Honeypot : succès simulé, rien n'est envoyé (ne renseigne pas le robot).
  if (input && typeof input === "object" && (input as Record<string, unknown>).botcheck) return json(200, { ok: true });

  if (rateLimited(clientKey(request))) return fail(429, MESSAGES.rate, { "Retry-After": "600" });

  const parsed = parseQuote(input);
  if (!parsed.ok) return fail(parsed.kind === "photos" ? 413 : 400, parsed.kind === "photos" ? MESSAGES.photos : MESSAGES.invalid);
  const { quote } = parsed;

  const config = readConfig();
  if (!config) return fail(500, MESSAGES.server);

  try {
    await sendBrevo(config, {
      sender: { name: SENDER_NAME, email: config.from },
      to: [{ email: config.to }],
      replyTo: { email: quote.email, name: quote.name },
      subject: buildSubject(quote),
      htmlContent: buildHtml(quote),
      textContent: buildText(quote),
      ...(quote.photos.length > 0 ? { attachment: quote.photos.map(({ name, content }) => ({ name, content })) } : {}),
    });
  } catch (error) {
    console.error("[api/devis] Échec de l’envoi Brevo :", error instanceof Error ? error.message : "erreur inconnue");
    return fail(502, MESSAGES.server);
  }
  return json(200, { ok: true });
}

/** Toute autre méthode : 405. */
const notAllowed = (_request?: Request) => fail(405, MESSAGES.method, { Allow: "POST" });
export const GET = notAllowed;
export const PUT = notAllowed;
export const PATCH = notAllowed;
export const DELETE = notAllowed;
export const OPTIONS = notAllowed;
