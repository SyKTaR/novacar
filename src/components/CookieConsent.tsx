import { useCallback, useEffect, useRef, useState } from "react";
import {
  getStoredConsent,
  onReopenConsentBanner,
  storeConsent,
  type ConsentChoice,
} from "../lib/consent";
import {
  getGa4MeasurementId,
  loadGoogleAnalytics,
  revokeGoogleAnalytics,
} from "../lib/analytics";

/**
 * Système de consentement cookies, affiché uniquement si GA4 est réellement
 * configuré (`VITE_GA4_MEASUREMENT_ID`).
 *
 * - 1re visite : carte flottante (bandeau) ; « Tout refuser » et « Tout
 *   accepter » ont un poids strictement égal (recommandation CNIL),
 *   « Continuer sans accepter » équivaut à refuser.
 * - « Personnaliser mes choix » : fenêtre modale (bottom sheet en mobile).
 * - Après un choix : petit bouton « Cookies » qui rouvre la fenêtre.
 */

type Mode = "closed" | "banner" | "modal";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function CookieIcon() {
  return (
    <svg className="cc-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-4-4 4 4 0 0 1-4-4 1 1 0 0 0-1-1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="8.5" cy="11" r="1.1" fill="currentColor" />
      <circle cx="12.5" cy="15.5" r="1.1" fill="currentColor" />
      <circle cx="15.5" cy="12" r="0.9" fill="currentColor" />
    </svg>
  );
}

interface SwitchProps {
  checked: boolean;
  disabled?: boolean;
  labelledBy: string;
  describedBy?: string;
  onChange?: (value: boolean) => void;
}

function Switch({ checked, disabled, labelledBy, describedBy, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className="cc-switch"
      data-locked={disabled ? "true" : undefined}
      onClick={() => {
        if (!disabled) onChange?.(!checked);
      }}
    >
      <span className="cc-switch-thumb" aria-hidden="true" />
    </button>
  );
}

export default function CookieConsent() {
  const [mode, setMode] = useState<Mode>("closed");
  const [hasChoice, setHasChoice] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const modeRef = useRef<Mode>("closed");
  const hasChoiceRef = useRef(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const reminderRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const changeMode = useCallback((next: Mode) => {
    modeRef.current = next;
    setMode(next);
  }, []);

  useEffect(() => {
    if (!getGa4MeasurementId()) return;

    const stored = getStoredConsent();
    if (stored === "accepted") loadGoogleAnalytics();
    hasChoiceRef.current = stored !== null;
    setHasChoice(stored !== null);
    setAnalytics(stored === "accepted");
    changeMode(stored === null ? "banner" : "closed");

    return onReopenConsentBanner(() => {
      if (modeRef.current === "modal") return;
      openerRef.current = document.activeElement as HTMLElement | null;
      setAnalytics(getStoredConsent() === "accepted");
      changeMode("modal");
    });
  }, [changeMode]);

  const closeModal = useCallback(() => {
    changeMode(hasChoiceRef.current ? "closed" : "banner");
  }, [changeMode]);

  const saveChoice = useCallback(
    (choice: ConsentChoice) => {
      const previous = getStoredConsent();
      storeConsent(choice);
      if (choice === "accepted") loadGoogleAnalytics();
      else if (previous === "accepted") revokeGoogleAnalytics();
      hasChoiceRef.current = true;
      setHasChoice(true);
      setAnalytics(choice === "accepted");
      changeMode("closed");
    },
    [changeMode],
  );

  // Modale : focus initial, piège à focus, Échap, verrou de scroll, retour du focus.
  useEffect(() => {
    if (mode !== "modal") return;
    const dialog = modalRef.current;
    if (!dialog) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const focusables = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null || element === document.activeElement,
      );
    focusables()[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!dialog!.contains(active)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      root.style.overflow = previousOverflow;
      window.requestAnimationFrame(() => {
        const opener = openerRef.current;
        if (opener && document.contains(opener)) opener.focus();
        else reminderRef.current?.focus();
      });
    };
  }, [mode, closeModal]);

  function openModal(event?: React.MouseEvent<HTMLElement>) {
    openerRef.current = (event?.currentTarget as HTMLElement | undefined) ?? null;
    setAnalytics(getStoredConsent() === "accepted");
    changeMode("modal");
  }

  if (mode === "closed" && !hasChoice) return null;

  return (
    <>
      {mode === "banner" && (
        <section
          className="cc-banner"
          role="dialog"
          aria-modal="false"
          aria-labelledby="cc-banner-title"
          aria-describedby="cc-banner-text"
        >
          <div className="cc-head">
            <CookieIcon />
            <p id="cc-banner-title" className="cc-title">
              Cookies et vie privée
            </p>
            <button type="button" className="cc-link cc-link--quiet" onClick={() => saveChoice("declined")}>
              Continuer sans accepter
            </button>
          </div>
          <p id="cc-banner-text" className="cc-text">
            Nous aimerions mesurer l’audience du site pour l’améliorer. Ces cookies ne sont
            déposés qu’avec votre accord, et vous pouvez changer d’avis à tout moment.
          </p>
          <a className="cc-policy" href="/cookies">
            Lire la politique de cookies
          </a>
          <div className="cc-actions">
            <button type="button" className="cc-btn cc-btn--light" onClick={() => saveChoice("declined")}>
              Tout refuser
            </button>
            <button type="button" className="cc-btn cc-btn--primary" onClick={() => saveChoice("accepted")}>
              Tout accepter
            </button>
          </div>
          <button type="button" className="cc-link cc-customize" onClick={openModal}>
            Personnaliser mes choix
          </button>
        </section>
      )}

      {mode === "modal" && (
        <div
          className="cc-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            ref={modalRef}
            className="cc-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cc-modal-title"
            aria-describedby="cc-modal-intro"
            data-lenis-prevent
          >
            <span className="cc-handle" aria-hidden="true" />
            <div className="cc-modal-head">
              <CookieIcon />
              <h2 id="cc-modal-title" className="cc-title cc-title--modal">
                Personnaliser mes choix
              </h2>
              <button type="button" className="cc-close" aria-label="Fermer sans modifier mes choix" onClick={closeModal}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <p id="cc-modal-intro" className="cc-text">
              Choisissez les cookies que vous acceptez. Votre choix est conservé 6 mois et
              modifiable à tout moment depuis le lien «&nbsp;Cookies&nbsp;» en bas de page.
            </p>

            <div className="cc-modal-body">
              <div className="cc-category">
                <div className="cc-category-head">
                  <div>
                    <p id="cc-necessary-label" className="cc-category-title">Cookies nécessaires</p>
                    <p className="cc-always">Toujours actifs</p>
                  </div>
                  <Switch checked disabled labelledBy="cc-necessary-label" describedBy="cc-necessary-desc" />
                </div>
                <p id="cc-necessary-desc" className="cc-text">
                  Indispensables au fonctionnement du site, par exemple pour mémoriser vos choix
                  sur les cookies. Ils ne peuvent pas être désactivés.
                </p>
              </div>

              <div className="cc-category">
                <div className="cc-category-head">
                  <p id="cc-audience-label" className="cc-category-title">Mesure d’audience</p>
                  <Switch
                    checked={analytics}
                    labelledBy="cc-audience-label"
                    describedBy="cc-audience-desc"
                    onChange={setAnalytics}
                  />
                </div>
                <p id="cc-audience-desc" className="cc-text">
                  Nous aident à comprendre comment le site est utilisé (pages vues, appareils)
                  grâce à Google Analytics, pour l’améliorer. Aucune donnée n’est utilisée à des
                  fins publicitaires.
                </p>
                <dl className="cc-cookies">
                  <div>
                    <dt>_ga</dt>
                    <dd>Distingue les visiteurs</dd>
                    <dd>13 mois</dd>
                  </div>
                  <div>
                    <dt>_ga_&lt;ID&gt;</dt>
                    <dd>Conserve l’état de la session</dd>
                    <dd>13 mois</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="cc-modal-actions">
              <button type="button" className="cc-btn cc-btn--outline" onClick={() => saveChoice("declined")}>
                Tout refuser
              </button>
              <button type="button" className="cc-btn cc-btn--outline" onClick={() => saveChoice("accepted")}>
                Tout accepter
              </button>
              <button
                type="button"
                className="cc-btn cc-btn--primary cc-save"
                onClick={() => saveChoice(analytics ? "accepted" : "declined")}
              >
                Enregistrer mes choix
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === "closed" && hasChoice && (
        <button ref={reminderRef} type="button" className="cc-reminder" onClick={openModal}>
          <CookieIcon />
          Cookies
        </button>
      )}
    </>
  );
}
