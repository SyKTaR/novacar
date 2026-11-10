import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { QuoteMotion } from "../../motion/quoteSteps";
import { buildRecap, MAX_INPUT_BYTES, MAX_PHOTOS, NEEDS, PHONE_DISPLAY, PHONE_HREF, STEP_LABELS, type NeedId } from "./data";
import { compressImage } from "./image";
import { CheckIcon, NeedIcon } from "./icons";
import PhotoDropzone, { type QuotePhoto } from "./PhotoDropzone";
import Stepper from "./Stepper";
import { PHOTOS_DROPPED_NOTE, submitQuote } from "./submit";
import { validateConsent, validateEmail, validateName, validatePhone, validateContact, type ContactErrors } from "./validate";

type Step = 1 | 2 | 3 | "done";
type Direction = 1 | -1;

const MOBILE_QUERY = "(max-width: 39.999rem)";
const subscribeMobile = (notify: () => void) => {
  const list = window.matchMedia(MOBILE_QUERY);
  list.addEventListener("change", notify);
  return () => list.removeEventListener("change", notify);
};
const useIsMobile = () =>
  useSyncExternalStore(subscribeMobile, () => window.matchMedia(MOBILE_QUERY).matches, () => false);

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let photoSeq = 0;

export default function QuoteForm({ onDone }: { onDone?: (done: boolean) => void }) {
  const uid = useId();
  const [step, setStep] = useState<Step>(1);
  const [need, setNeed] = useState<NeedId | null>(null);
  const [needError, setNeedError] = useState("");
  const [photos, setPhotos] = useState<QuotePhoto[]>([]);
  const [photoMessage, setPhotoMessage] = useState("");
  const [processing, setProcessing] = useState(0);
  const [vehicle, setVehicle] = useState("");
  const [details, setDetails] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [photosDropped, setPhotosDropped] = useState(false);
  const [announce, setAnnounce] = useState("");
  const isMobile = useIsMobile();

  const cardRef = useRef<HTMLDivElement>(null);
  const stepperRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const firstNeedRef = useRef<HTMLInputElement | null>(null);
  const fieldRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const motionRef = useRef<QuoteMotion | null>(null);
  const navToken = useRef(0);
  const pendingNav = useRef<{ direction: Direction; height: number }>({ direction: 1, height: 0 });
  const prevStep = useRef<Step>(1);
  const photosRef = useRef<QuotePhoto[]>([]);
  const inflight = useRef(0);
  const seenThumbs = useRef(new Set<string>());
  const sendingRef = useRef(false);
  photosRef.current = photos;

  // Chargement dynamique de gsap (comme le reste du site) : le formulaire fonctionne sans.
  useEffect(() => {
    let alive = true;
    let motion: QuoteMotion | null = null;
    void import("../../motion/quoteSteps")
      .then(({ createQuoteMotion }) => {
        if (!alive || !cardRef.current) return;
        motion = createQuoteMotion(cardRef.current);
        motionRef.current = motion;
      })
      .catch(() => undefined);
    return () => {
      alive = false;
      motion?.destroy();
      motionRef.current = null;
    };
  }, []);

  // Libère les aperçus au démontage.
  useEffect(
    () => () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url));
    },
    [],
  );

  const scrollToCard = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    const top = card.getBoundingClientRect().top;
    if (top >= 88) return;
    const lenis = window.__lenis;
    if (lenis) lenis.scrollTo(card, { offset: -96, duration: 0.8 });
    else window.scrollBy({ top: top - 96, behavior: reducedMotion() ? "auto" : "smooth" });
  }, []);

  /** Sortie animée → changement d'état → entrée (voir useLayoutEffect ci-dessous). */
  const go = useCallback(
    async (next: Step, direction: Direction, beforeCommit?: () => void) => {
      const token = ++navToken.current;
      const body = bodyRef.current;
      const height = body ? body.getBoundingClientRect().height : 0;
      const motion = motionRef.current;
      if (motion) await motion.exit(panelRef.current, direction);
      if (token !== navToken.current) return;
      pendingNav.current = { direction, height };
      beforeCommit?.();
      setStep(next);
    },
    [],
  );

  useLayoutEffect(() => {
    const previous = prevStep.current;
    if (previous === step) return;
    prevStep.current = step;
    const { direction, height } = pendingNav.current;
    const motion = motionRef.current;
    const toNumber = (value: Step) => (value === "done" ? 4 : value);
    if (step === "done") {
      motion?.enter(panelRef.current, bodyRef.current, direction, height, false);
      motion?.confirm(panelRef.current);
    } else {
      motion?.enter(panelRef.current, bodyRef.current, direction, height);
    }
    if (step !== "done" && previous !== "done") motion?.stepper(toNumber(previous), toNumber(step));
    headingRef.current?.focus({ preventScroll: true });
    setAnnounce(step === "done" ? "Demande envoyée" : `Étape ${step} sur 3 : ${STEP_LABELS[step - 1]}`);
    onDone?.(step === "done");
    scrollToCard();
  }, [step, onDone, scrollToCard]);

  // Aperçus : apparition (scale + fade) des seules nouvelles vignettes.
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const ids = new Set(photos.map((photo) => photo.id));
    photos.forEach((photo) => {
      if (seenThumbs.current.has(photo.id)) return;
      seenThumbs.current.add(photo.id);
      const item = card.querySelector<HTMLElement>(`[data-photo-id="${photo.id}"]`);
      if (item) motionRef.current?.thumbIn(item);
    });
    seenThumbs.current.forEach((id) => {
      if (!ids.has(id)) seenThumbs.current.delete(id);
    });
  }, [photos]);

  /* ---------- Photos ---------- */

  const addFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    setPhotoMessage("");
    const messages: string[] = [];
    const candidates: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) messages.push(`« ${file.name} » n’est pas une image : seules les photos sont acceptées.`);
      else if (file.size > MAX_INPUT_BYTES) messages.push(`« ${file.name} » dépasse 12 Mo.`);
      else candidates.push(file);
    }
    const free = MAX_PHOTOS - photosRef.current.filter((photo) => !photo.leaving).length - inflight.current;
    const accepted = candidates.slice(0, Math.max(0, free));
    if (candidates.length > accepted.length) messages.push(`${MAX_PHOTOS} photos au maximum.`);

    if (accepted.length > 0) {
      inflight.current += accepted.length;
      setProcessing((value) => value + accepted.length);
      const results = await Promise.all(
        accepted.map(async (file) => {
          try {
            return await compressImage(file);
          } catch {
            messages.push(`« ${file.name} » n’a pas pu être lue. Essayez une photo au format JPEG ou PNG.`);
            return null;
          }
        }),
      );
      inflight.current -= accepted.length;
      setProcessing((value) => value - accepted.length);
      const added: QuotePhoto[] = results.flatMap((file) =>
        file ? [{ id: `p${++photoSeq}`, file, url: URL.createObjectURL(file), leaving: false }] : [],
      );
      if (added.length > 0) setPhotos((current) => [...current, ...added]);
    }
    setPhotoMessage(messages.join(" "));
  }, []);

  const removePhoto = useCallback(async (id: string) => {
    setPhotoMessage("");
    setPhotos((current) => current.map((photo) => (photo.id === id ? { ...photo, leaving: true } : photo)));
    const item = cardRef.current?.querySelector<HTMLElement>(`[data-photo-id="${id}"]`);
    if (item && motionRef.current) await motionRef.current.thumbOut(item);
    const target = photosRef.current.find((photo) => photo.id === id);
    if (target) URL.revokeObjectURL(target.url);
    setPhotos((current) => current.filter((photo) => photo.id !== id));
  }, []);

  /* ---------- Navigation et validation ---------- */

  const activePhotos = photos.filter((photo) => !photo.leaving);

  const resetAll = () => {
    photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url));
    setPhotos([]);
    setNeed(null);
    setVehicle("");
    setDetails("");
    setName("");
    setPhone("");
    setEmail("");
    setConsent(false);
    setErrors({});
    setPhotoMessage("");
  };

  const send = async () => {
    if (sendingRef.current || !need) return;
    const found = validateContact({ name, phone, email, consent });
    setErrors(found);
    const order = ["name", "phone", "email", "consent"] as const;
    const firstInvalid = order.find((key) => found[key]);
    if (firstInvalid) {
      fieldRefs.current[firstInvalid]?.focus();
      return;
    }
    // Honeypot : un bot remplit tout le DOM. On simule le succès sans appel réseau.
    if (honeypotRef.current?.checked) {
      void go("done", 1, () => {
        setPhotosDropped(false);
        resetAll();
      });
      return;
    }
    sendingRef.current = true;
    setSending(true);
    setSendError("");
    const result = await submitQuote({
      need,
      vehicle,
      details,
      name,
      phone,
      email,
      photos: activePhotos.map((photo) => photo.file),
    });
    sendingRef.current = false;
    setSending(false);
    if (result.ok) {
      void go("done", 1, () => {
        setPhotosDropped(result.photosDropped);
        resetAll();
      });
    } else if (result.reason === "rate-limited") {
      setSendError(`Trop de tentatives d’envoi. Patientez quelques minutes, ou appelez-nous au ${PHONE_DISPLAY}.`);
    } else {
      setSendError(`L’envoi n’a pas abouti. Votre saisie est conservée : réessayez, ou appelez-nous au ${PHONE_DISPLAY}.`);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    if (step === 1) {
      if (!need) {
        setNeedError("Choisissez un besoin pour continuer");
        firstNeedRef.current?.focus();
        return;
      }
      void go(2, 1);
    } else if (step === 2) {
      void go(3, 1);
    } else if (step === 3) {
      void send();
    }
  };

  const onNeedChange = (event: ChangeEvent<HTMLInputElement>, id: NeedId) => {
    setNeed(id);
    setNeedError("");
    const icon = event.currentTarget.closest("label")?.querySelector<HTMLElement>(".quote-need-icon");
    motionRef.current?.pick(icon ?? null);
  };

  const fieldProps = (key: keyof ContactErrors) => ({
    "aria-invalid": errors[key] ? (true as const) : undefined,
    "aria-describedby": errors[key] ? `${uid}-${key}-error` : undefined,
    ref: (node: HTMLInputElement | null) => {
      fieldRefs.current[key] = node;
    },
  });
  const recheck = (key: keyof ContactErrors, message: string) =>
    setErrors((current) => (current[key] === undefined && !message ? current : { ...current, [key]: message || undefined }));

  const headingRefCb = (node: HTMLHeadingElement | null) => {
    headingRef.current = node;
  };
  const panelRefCb = (node: HTMLDivElement | null) => {
    panelRef.current = node;
  };

  const numericStep = step === "done" ? null : step;

  return (
    <div className="quote-card" ref={cardRef} data-step={step}>
      <p className="sr-only" role="status" aria-live="polite">{announce}</p>

      <div className={`quote-stepper-wrap${step === "done" ? " is-collapsed" : ""}`} ref={stepperRef} aria-hidden={step === "done" ? true : undefined}>
        <div className="quote-stepper-inner">
          <Stepper step={numericStep ?? 3} />
        </div>
      </div>

      <form className="quote-form" noValidate onSubmit={onSubmit} aria-label="Demande de devis">
        <input
          ref={honeypotRef}
          type="checkbox"
          name="botcheck"
          className="contact-honeypot"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <div className="quote-body" ref={bodyRef}>
          {step === 1 && (
            <div className="quote-panel" key="step-1" ref={panelRefCb}>
              <h3 className="quote-step-title" id={`${uid}-title`} tabIndex={-1} ref={headingRefCb}>
                Quel est votre besoin ?
              </h3>
              <fieldset
                className="quote-needs"
                role="radiogroup"
                aria-labelledby={`${uid}-title`}
                aria-describedby={needError ? `${uid}-need-error` : undefined}
                aria-invalid={needError ? true : undefined}
              >
                {NEEDS.map((item, index) => (
                  <label key={item.id} className={`quote-need${need === item.id ? " is-selected" : ""}`}>
                    <input
                      ref={index === 0 ? firstNeedRef : undefined}
                      className="quote-need-input"
                      type="radio"
                      name="need"
                      value={item.id}
                      checked={need === item.id}
                      onChange={(event) => onNeedChange(event, item.id)}
                    />
                    <NeedIcon id={item.id} />
                    <span className="quote-need-text">
                      <span className="quote-need-label">{item.label}</span>
                      <span className="quote-need-hint">{item.hint}</span>
                    </span>
                  </label>
                ))}
              </fieldset>
              {needError && (
                <p className="quote-error" id={`${uid}-need-error`} role="alert">{needError}</p>
              )}
              <div className="quote-actions quote-actions--end">
                <button type="submit" className="btn btn-primary quote-next">Continuer</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="quote-panel" key="step-2" ref={panelRefCb}>
              <div className="quote-title-row">
                <h3 className="quote-step-title" tabIndex={-1} ref={headingRefCb}>Photos et véhicule</h3>
                <span className="quote-badge">Facultatif</span>
              </div>
              <p className="quote-lead">Une photo nous aide à vous donner un prix précis. Vous pouvez aussi passer cette étape.</p>

              <PhotoDropzone photos={photos} busy={processing > 0} message={photoMessage} onFiles={addFiles} onRemove={removePhoto} />

              <div className="quote-field">
                <label htmlFor={`${uid}-vehicle`}>Véhicule</label>
                <input
                  id={`${uid}-vehicle`}
                  name="vehicle"
                  type="text"
                  autoComplete="off"
                  enterKeyHint="next"
                  placeholder={isMobile ? "Ex. Peugeot 3008" : "Marque et modèle, ex. Peugeot 3008"}
                  value={vehicle}
                  onChange={(event) => setVehicle(event.target.value)}
                />
              </div>
              <div className="quote-field">
                <label htmlFor={`${uid}-details`}>Précisions</label>
                <textarea
                  id={`${uid}-details`}
                  name="details"
                  rows={4}
                  placeholder="Ex. deux jantes avant rayées"
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                />
              </div>

              <div className="quote-actions quote-actions--split">
                <button type="button" className="btn quote-back" onClick={() => void go(1, -1)}>
                  <span className="quote-back-arrow" aria-hidden="true">←</span>Retour
                </button>
                <button type="button" className="quote-skip" onClick={() => void go(3, 1)}>Passer cette étape</button>
                <button type="submit" className="btn btn-primary quote-next">Continuer</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="quote-panel" key="step-3" ref={panelRefCb}>
              <h3 className="quote-step-title" tabIndex={-1} ref={headingRefCb}>Vos coordonnées</h3>

              <div className="quote-recap">
                <div>
                  <p className="quote-recap-label">Votre demande</p>
                  <p className="quote-recap-value">{buildRecap(need, activePhotos.length, vehicle)}</p>
                </div>
                <button type="button" className="quote-link" onClick={() => void go(1, -1)} disabled={sending}>Modifier</button>
              </div>

              <div className="quote-field">
                <label htmlFor={`${uid}-name`}>Nom et prénom</label>
                <input
                  id={`${uid}-name`}
                  name="name"
                  type="text"
                  autoComplete="name"
                  enterKeyHint="next"
                  placeholder="Ex. Jean Dupont"
                  value={name}
                  onChange={(event) => { setName(event.target.value); if (errors.name) recheck("name", validateName(event.target.value)); }}
                  {...fieldProps("name")}
                />
                {errors.name && <p className="quote-error" id={`${uid}-name-error`}>{errors.name}</p>}
              </div>

              <div className="quote-field-row">
                <div className="quote-field">
                  <label htmlFor={`${uid}-phone`}>Téléphone</label>
                  <input
                    id={`${uid}-phone`}
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    enterKeyHint="next"
                    placeholder="06 12 34 56 78"
                    value={phone}
                    onChange={(event) => { setPhone(event.target.value); if (errors.phone) recheck("phone", validatePhone(event.target.value)); }}
                    {...fieldProps("phone")}
                  />
                  {errors.phone && <p className="quote-error" id={`${uid}-phone-error`}>{errors.phone}</p>}
                </div>
                <div className="quote-field">
                  <label htmlFor={`${uid}-email`}>E-mail</label>
                  <input
                    id={`${uid}-email`}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    enterKeyHint="send"
                    placeholder="jean@exemple.fr"
                    value={email}
                    onChange={(event) => { setEmail(event.target.value); if (errors.email) recheck("email", validateEmail(event.target.value)); }}
                    {...fieldProps("email")}
                  />
                  {errors.email && <p className="quote-error" id={`${uid}-email-error`}>{errors.email}</p>}
                </div>
              </div>

              <div className="quote-consent-wrap">
                <label className="quote-consent">
                  <input
                    className="quote-consent-input"
                    type="checkbox"
                    name="consent"
                    checked={consent}
                    onChange={(event) => { setConsent(event.target.checked); if (errors.consent) recheck("consent", validateConsent(event.target.checked)); }}
                    {...fieldProps("consent")}
                  />
                  <span className="quote-checkbox" aria-hidden="true"><CheckIcon className="quote-checkbox-icon" /></span>
                  <span className="quote-consent-text">
                    J’accepte que mes données soient utilisées pour traiter ma demande de devis.{" "}
                    <a href="/politique-confidentialite" target="_blank" rel="noopener">
                      Politique de confidentialité<span className="sr-only"> (s’ouvre dans un nouvel onglet)</span>
                    </a>
                  </span>
                </label>
                {errors.consent && <p className="quote-error" id={`${uid}-consent-error`}>{errors.consent}</p>}
              </div>

              {sendError && <p className="quote-send-error" role="alert">{sendError}</p>}

              <div className="quote-actions quote-actions--split quote-actions--final">
                <button type="button" className="btn quote-back" onClick={() => void go(2, -1)} disabled={sending}>
                  <span className="quote-back-arrow" aria-hidden="true">←</span>Retour
                </button>
                <button type="submit" className="btn btn-primary quote-next quote-send" disabled={sending} aria-busy={sending || undefined}>
                  {sending ? "Envoi en cours…" : sendError ? "Réessayer l’envoi" : "Envoyer ma demande"}
                </button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="quote-panel quote-done" key="done" ref={panelRefCb}>
              <div className="quote-done-disc" aria-hidden="true">
                <CheckIcon className="quote-done-check" />
              </div>
              <h3 className="quote-step-title quote-done-title" tabIndex={-1} ref={headingRefCb}>Demande envoyée</h3>
              <p className="quote-done-copy">Merci. On étudie votre demande et on vous rappelle sous 48 h avec un prix ferme.</p>
              {photosDropped && <p className="quote-done-note">{PHOTOS_DROPPED_NOTE}</p>}
              <div className="quote-done-box">
                <p>Une question en attendant ?</p>
                <a href={PHONE_HREF}>{PHONE_DISPLAY}</a>
              </div>
              <a className="btn quote-back quote-done-home" href="/#accueil">Retour à l’accueil</a>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
