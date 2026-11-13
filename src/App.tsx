import { useEffect, useRef, useState } from "react";
import { usePageMotion } from "./motion/usePageMotion";
import Header from "./components/Header";
import BlurText from "./components/BlurText";
import StatsSection from "./components/StatsSection";
import AboutSection from "./components/AboutSection";
import ServicesSection from "./components/ServicesSection";
import RealisationsSection from "./components/RealisationsSection";
import SeoContentSection from "./components/SeoContentSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import heroPoster from "./assets/brand/hero-poster.jpg";
import heroVideo from "./assets/brand/hero-video.mp4";

export default function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [heroMotionAllowed, setHeroMotionAllowed] = useState(false);

  // La vidéo ne démarre qu'après lecture de la préférence système et s'arrête
  // immédiatement si celle-ci change pendant la visite.
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setHeroMotionAllowed(!preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    if (!heroMotionAllowed) video.pause();
    else void video.play().catch(() => undefined);
  }, [heroMotionAllowed]);

  usePageMotion(appRef);

  return (
    <div ref={appRef} className="app-shell">
      <a className="skip-link" href="#main-content">
        Aller au contenu principal
      </a>
      <Header />

      <main id="main-content">
        <section id="accueil" className="hero" aria-labelledby="hero-title">
          <div className="hero-media" aria-hidden="true">
            <video
              ref={heroVideoRef}
              src={heroVideo}
              poster={heroPoster}
              autoPlay={heroMotionAllowed}
              muted
              loop
              playsInline
              preload={heroMotionAllowed ? "auto" : "metadata"}
              disablePictureInPicture
              tabIndex={-1}
            />
          </div>

          <div className="hero-content">
            <p className="hero-kicker">Intervention mobile en Île-de-France</p>

            <BlurText
              as="h1"
              id="hero-title"
              text="Retouche peinture carrosserie & rénovation de jantes"
              className="hero-title"
            />

            <p className="hero-copy">
              Novacar intervient à domicile ou en atelier pour la rénovation de
              jantes, les retouches de peinture localisées et le lustrage automobile.
            </p>

            <div className="hero-actions">
              <a className="btn btn-primary" href="#contact">
                Demander un devis
              </a>
              <a className="btn btn-secondary" href="#tarifs">
                Voir les tarifs
              </a>
            </div>
          </div>
        </section>

        <StatsSection />
        {/* Partenaires masqués : aucun logo réel fourni (PartnersSection à réactiver quand le client les envoie) */}
        <AboutSection />
        <ServicesSection />
        <RealisationsSection />
        <SeoContentSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
