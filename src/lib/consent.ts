/**
 * Gestion minimale du consentement cookies (CNIL) pour Novacar.
 *
 * Un seul traceur non essentiel existe aujourd'hui : Google Analytics 4
 * (voir `analytics.ts`). Tant que l'utilisateur n'a pas explicitement
 * accepté, GA4 n'est jamais chargé.
 */

export type ConsentChoice = "accepted" | "declined";

const CONSENT_KEY = "novacar:cookie-consent";
const REOPEN_EVENT = "novacar:reopen-consent";

export function getStoredConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "accepted" || value === "declined" ? value : null;
  } catch {
    // Stockage bloqué (navigation privée stricte, etc.) : on considère
    // qu'aucun choix n'est mémorisé, le bandeau restera affiché.
    return null;
  }
}

export function storeConsent(choice: ConsentChoice) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // Rien à faire si le stockage est indisponible : le bandeau réapparaîtra
    // à la prochaine visite, ce qui reste un comportement sûr.
  }
}

/** Permet à n'importe quel lien "Gérer mes cookies" (footer, page /cookies)
 * de rouvrir le bandeau pour changer d'avis, sans effacer l'ancien choix
 * tant que l'utilisateur n'a pas validé le nouveau. */
export function requestReopenConsentBanner() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(REOPEN_EVENT));
}

export function onReopenConsentBanner(handler: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(REOPEN_EVENT, handler);
  return () => window.removeEventListener(REOPEN_EVENT, handler);
}
