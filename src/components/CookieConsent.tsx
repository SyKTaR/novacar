import { useEffect, useState } from "react";
import {
  getStoredConsent,
  onReopenConsentBanner,
  storeConsent,
} from "../lib/consent";
import { getGa4MeasurementId, loadGoogleAnalytics } from "../lib/analytics";

/**
 * Bandeau de consentement cookies, affiché uniquement si GA4 est réellement
 * configuré (`VITE_GA4_MEASUREMENT_ID`) et tant qu'aucun choix n'a été
 * mémorisé. Accepter / Refuser ont un poids strictement égal (recommandation
 * CNIL) — aucun des deux boutons n'est mis en avant visuellement.
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getGa4MeasurementId()) return;

    const stored = getStoredConsent();
    if (stored === "accepted") {
      loadGoogleAnalytics();
    } else if (stored === null) {
      setVisible(true);
    }

    return onReopenConsentBanner(() => setVisible(true));
  }, []);

  if (!visible) return null;

  function handleChoice(accepted: boolean) {
    storeConsent(accepted ? "accepted" : "declined");
    if (accepted) loadGoogleAnalytics();
    setVisible(false);
  }

  return (
    <div
      className="cookie-consent"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
    >
      <div className="cookie-consent-inner">
        <p id="cookie-consent-title" className="cookie-consent-text">
          Novacar utilise Google Analytics pour mesurer la fréquentation du
          site. Vous pouvez accepter ou refuser ce suivi ; votre choix reste
          modifiable à tout moment depuis la page{" "}
          <a href="/cookies">Gestion des cookies</a>.
        </p>
        <div className="cookie-consent-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleChoice(false)}
          >
            Refuser
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleChoice(true)}
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
