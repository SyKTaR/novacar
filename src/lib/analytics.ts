/**
 * Google Analytics 4 — chargement conditionnel.
 *
 * Deux conditions doivent être réunies avant tout chargement du script
 * gtag.js :
 * 1. `VITE_GA4_MEASUREMENT_ID` est défini au build (voir .env.example) —
 *    tant que Lucas n'a pas fourni l'identifiant de mesure réel, rien ne
 *    se charge, même en production.
 * 2. L'utilisateur a explicitement accepté les cookies via le bandeau de
 *    consentement (voir `consent.ts` / `CookieConsent.tsx`).
 *
 * Ne jamais appeler cette fonction ailleurs que depuis le flux de
 * consentement pour rester conforme aux recommandations CNIL.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let loaded = false;

export function getGa4MeasurementId(): string | undefined {
  const id = import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined;
  return id && id.trim().length > 0 ? id.trim() : undefined;
}

export function loadGoogleAnalytics() {
  if (typeof window === "undefined") return;

  const measurementId = getGa4MeasurementId();
  if (!measurementId) return;

  // Réactive la mesure si elle avait été révoquée plus tôt dans la session.
  (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = false;
  if (loaded) return;

  loaded = true;

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", measurementId, { anonymize_ip: true });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

/**
 * Révocation : désactive la mesure pour la session en cours (drapeau officiel
 * `ga-disable-<ID>`) et supprime les cookies `_ga` / `_ga_<ID>` posés
 * auparavant. Sans effet si GA4 n'a jamais été chargé.
 */
export function revokeGoogleAnalytics() {
  if (typeof window === "undefined") return;
  const measurementId = getGa4MeasurementId();
  if (!measurementId) return;

  (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = true;

  const hosts = new Set<string | undefined>([undefined, window.location.hostname]);
  const parts = window.location.hostname.split(".");
  for (let i = 0; i < parts.length - 1; i += 1) hosts.add(`.${parts.slice(i).join(".")}`);

  document.cookie.split(";").forEach((entry) => {
    const name = entry.split("=")[0].trim();
    if (name !== "_ga" && !name.startsWith("_ga_") && name !== "_gid") return;
    hosts.forEach((host) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${host ? `; domain=${host}` : ""}`;
    });
  });
}
