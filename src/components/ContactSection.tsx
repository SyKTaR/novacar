import { useState } from "react";
import type { FormEvent } from "react";

type FormStatus = "idle" | "loading" | "success" | "error";

/**
 * Section "Contact" — colonne infos (kicker, titre, coordonnées) + colonne
 * formulaire, envoyé via Web3Forms (pas de backend à héberger).
 *
 * Clé publique lue depuis `VITE_WEB3FORMS_KEY` (voir .env.example à la
 * racine du repo). Aucune clé réelle n'est commitée : tant que la variable
 * n'est pas renseignée, le formulaire affiche un message d'erreur explicite
 * au lieu d'échouer silencieusement.
 *
 * Coordonnées (téléphone, e-mail, adresse atelier, horaires) : PLACEHOLDER
 * repris de la maquette Figma de Lucas, à remplacer par les vraies
 * informations avant mise en ligne. Voir report.md.
 */
export default function ContactSection() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const accessKey = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;
    if (!accessKey) {
      setStatus("error");
      setErrorMessage(
        "Formulaire non configuré : clé Web3Forms manquante (VITE_WEB3FORMS_KEY).",
      );
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append("access_key", accessKey);
    formData.append("subject", "Nouvelle demande de devis — Novacar");
    formData.append("from_name", "Site Novacar");

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
        setErrorMessage(
          result.message ?? "L'envoi a échoué, merci de réessayer.",
        );
      }
    } catch {
      setStatus("error");
      setErrorMessage(
        "Impossible d'envoyer le message pour le moment, merci de réessayer.",
      );
    }
  }

  return (
    <section id="contact" className="contact" aria-labelledby="contact-title">
      <div className="contact-grid">
        <div className="contact-intro">
          <p className="contact-eyebrow">Contact</p>
          <h2 id="contact-title" className="contact-title">
            Un devis gratuit sous 48&nbsp;h
          </h2>
          <p className="contact-copy">
            Envoyez-nous une photo de la jante ou de l'impact. On vous répond
            avec un prix ferme, sans engagement.
          </p>

          <dl className="contact-details">
            <div className="contact-detail">
              <dt>Téléphone</dt>
              <dd>
                01 85 10 00 01
              </dd>
            </div>
            <div className="contact-detail">
              <dt>E-mail</dt>
              <dd>
                contact@nova-car.fr
              </dd>
            </div>
            <div className="contact-detail">
              <dt>Atelier</dt>
              <dd>
                Adresse à compléter — Île-de-France
              </dd>
            </div>
            <div className="contact-detail">
              <dt>Horaires</dt>
              <dd>
                Lundi au vendredi, 8h–18h
              </dd>
            </div>
          </dl>
        </div>

        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <div className="contact-field">
            <label htmlFor="contact-name">Nom et prénom</label>
            <input id="contact-name" name="name" type="text" autoComplete="name" required />
          </div>

          <div className="contact-field">
            <label htmlFor="contact-email">E-mail</label>
            <input id="contact-email" name="email" type="email" autoComplete="email" required />
          </div>

          <div className="contact-field">
            <label htmlFor="contact-phone">Téléphone</label>
            <input id="contact-phone" name="phone" type="tel" autoComplete="tel" required />
          </div>

          <div className="contact-field">
            <label htmlFor="contact-vehicle">Véhicule (marque, modèle)</label>
            <input id="contact-vehicle" name="vehicle" type="text" required />
          </div>

          <div className="contact-field">
            <label htmlFor="contact-need">Décrivez votre besoin</label>
            <textarea id="contact-need" name="message" rows={4} required />
          </div>

          <button type="submit" className="btn btn-primary contact-submit" disabled={status === "loading"}>
            {status === "loading" ? "Envoi en cours…" : "Envoyer ma demande"}
          </button>

          <p
            role="status"
            aria-live="polite"
            className={
              status === "success"
                ? "contact-form-status contact-form-status--success"
                : status === "error"
                  ? "contact-form-status contact-form-status--error"
                  : "contact-form-status"
            }
          >
            {status === "success" &&
              "Merci, votre demande a bien été envoyée. On revient vers vous sous 48h."}
            {status === "error" && (errorMessage ?? "Une erreur est survenue.")}
          </p>
        </form>
      </div>
    </section>
  );
}
