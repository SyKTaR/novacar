import { useState } from "react";
import QuoteForm from "./quote/QuoteForm";

/**
 * Section « Contact » : parcours de devis en 3 étapes (besoin → photos et
 * véhicule → coordonnées) puis confirmation. L'envoi passe par la fonction
 * serveur `/api/devis` (e-mail via Brevo, voir api/devis.ts et .env.example).
 * Le HTML prérendu contient le titre et l'étape 1.
 */
export default function ContactSection() {
  const [done, setDone] = useState(false);

  return (
    <section id="contact" className="contact" aria-labelledby="contact-title">
      <div className="contact-inner">
        <div className="contact-intro">
          <h2 id="contact-title" className="contact-title">
            Un devis gratuit sous 48&nbsp;h
          </h2>
          <div className={`contact-copy-wrap${done ? " is-collapsed" : ""}`} aria-hidden={done ? true : undefined}>
            <p className="contact-copy">
              Trois étapes, moins d’une minute.<span className="contact-copy-extra"> Prix ferme, sans engagement.</span>
            </p>
          </div>
        </div>
        <QuoteForm onDone={setDone} />
      </div>
    </section>
  );
}
