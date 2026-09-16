import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

/**
 * Page 404 dédiée, prérendue vers `dist/404.html` (voir `scripts/prerender.mjs`).
 * Vercel sert automatiquement ce fichier pour toute route inconnue sur un
 * déploiement statique, à la place de sa page 404 générique.
 */
export default function NotFound() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Page introuvable | Novacar";
    window.scrollTo(0, 0);

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="app-shell legal-page">
      <a className="skip-link" href="#legal-main-content">
        Aller au contenu principal
      </a>

      <Header />

      <main id="legal-main-content">
        <section className="legal-page-hero" aria-labelledby="legal-page-title">
          <div className="legal-page-hero-inner">
            <p className="legal-page-eyebrow">Erreur 404</p>
            <h1 id="legal-page-title">Cette page n’existe pas</h1>
            <p className="legal-page-summary">
              Le lien suivi est peut-être incorrect ou la page a été déplacée.
              Retrouvez nos services de retouche peinture et de rénovation de
              jantes depuis l’accueil.
            </p>
            <div className="hero-actions" style={{ marginTop: "1.5rem" }}>
              <a className="btn btn-primary" href="/">
                Retour à l’accueil
              </a>
              <a className="btn btn-secondary" href="/#contact">
                Nous contacter
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
