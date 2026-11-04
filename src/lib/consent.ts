/**
 * Gestion du consentement cookies (CNIL) pour Novacar.
 *
 * Un seul traceur non essentiel existe aujourd'hui : Google Analytics 4
 * (voir `analytics.ts`). Tant que l'utilisateur n'a pas explicitement
 * accepté, GA4 n'est jamais chargé.
 *
 * Le choix est stocké dans le localStorage sous la clé `novacar_consent`
 * (JSON : choix, date d'enregistrement, date d'expiration). Il est conservé
 * 6 mois, puis le bandeau redemande l'accord.
 */

export type ConsentChoice = "accepted" | "declined";

export const CONSENT_KEY = "novacar_consent";
export const CONSENT_DURATION_MONTHS = 6;
const LEGACY_CONSENT_KEY = "novacar:cookie-consent";
const REOPEN_EVENT = "novacar:reopen-consent";

export interface ConsentRecord {
  choice: ConsentChoice;
  savedAt: string;
  expiresAt: string;
}

export function getConsentExpiry(from: Date = new Date()): Date {
  const expiry = new Date(from.getTime());
  expiry.setMonth(expiry.getMonth() + CONSENT_DURATION_MONTHS);
  return expiry;
}

/** Choix mémorisé et encore valide, sinon null (absent, expiré, illisible). */
export function getConsentRecord(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    // Ancienne clé (avant la politique de 6 mois) : on la purge, le choix
    // est redemandé une fois.
    window.localStorage.removeItem(LEGACY_CONSENT_KEY);

    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentRecord> | null;
    const valid =
      parsed &&
      (parsed.choice === "accepted" || parsed.choice === "declined") &&
      typeof parsed.expiresAt === "string" &&
      typeof parsed.savedAt === "string";
    const expiresAt = valid ? Date.parse(parsed.expiresAt as string) : NaN;
    if (!valid || Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
      window.localStorage.removeItem(CONSENT_KEY);
      return null;
    }
    return parsed as ConsentRecord;
  } catch {
    // Stockage bloqué (navigation privée stricte, etc.) ou JSON invalide :
    // aucun choix mémorisé, le bandeau restera affiché.
    return null;
  }
}

export function getStoredConsent(): ConsentChoice | null {
  return getConsentRecord()?.choice ?? null;
}

export function storeConsent(choice: ConsentChoice) {
  if (typeof window === "undefined") return;
  const now = new Date();
  const record: ConsentRecord = {
    choice,
    savedAt: now.toISOString(),
    expiresAt: getConsentExpiry(now).toISOString(),
  };
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
  } catch {
    // Rien à faire si le stockage est indisponible : le bandeau réapparaîtra
    // à la prochaine visite, ce qui reste un comportement sûr.
  }
}

/** Permet à n'importe quel lien « Gérer mes cookies » (footer, pages
 * légales) d'ouvrir la fenêtre « Personnaliser mes choix », sans effacer
 * l'ancien choix tant que l'utilisateur n'a pas validé le nouveau. */
export function requestReopenConsentBanner() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(REOPEN_EVENT));
}

export function onReopenConsentBanner(handler: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(REOPEN_EVENT, handler);
  return () => window.removeEventListener(REOPEN_EVENT, handler);
}
