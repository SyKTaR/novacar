import { useLayoutEffect, useRef, useState } from "react";
import "./IntroOverlay.css";

const INTRO_SESSION_KEY = "novacar:intro-viewed";
const FAIL_OPEN_TIMEOUT_MS = 2300;

export function consumeIntroSession() {
  if (typeof window === "undefined") return false;

  try {
    if (window.sessionStorage.getItem(INTRO_SESSION_KEY)) return false;
    window.sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    // Si le stockage est bloqué, la page reste immédiatement accessible.
    return false;
  }
}

interface IntroOverlayProps {
  play: boolean;
}

export default function IntroOverlay({ play }: IntroOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(play);

  useLayoutEffect(() => {
    if (!play || !visible) return;

    const overlay = overlayRef.current;
    if (!overlay) {
      setVisible(false);
      return;
    }
    const animationScope = overlay;

    let disposed = false;
    let finished = false;
    let gsapContext: { revert: () => void } | undefined;

    const finish = () => {
      if (disposed || finished) return;
      finished = true;
      window.clearTimeout(failOpenTimer);
      document.documentElement.classList.remove("novacar-intro-active");
      setVisible(false);
      window.dispatchEvent(new Event("novacar:intro-complete"));
    };

    document.documentElement.classList.add("novacar-intro-active");
    const failOpenTimer = window.setTimeout(finish, FAIL_OPEN_TIMEOUT_MS);

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreferenceChange = () => { if (preference.matches) finish(); };
    preference.addEventListener("change", onPreferenceChange);

    async function runTimeline() {
      try {
        const { default: gsap } = await import("gsap");
        if (disposed) return;

        if (preference.matches) { finish(); return; }

        gsapContext = gsap.context(() => {
          const timeline = gsap.timeline({ onComplete: finish });

          timeline
            .fromTo(
              ".novacar-intro__pigment--coarse",
              {
                autoAlpha: 0,
                scale: 1.55,
                x: -10,
                y: 7,
              },
              {
                autoAlpha: 0.58,
                scale: 1.06,
                x: 0,
                y: 0,
                duration: 0.58,
                ease: "power3.out",
              },
              0.04,
            )
            .fromTo(
              ".novacar-intro__pigment--fine",
              {
                autoAlpha: 0,
                scale: 1.28,
                x: 12,
                y: -5,
              },
              {
                autoAlpha: 0.52,
                scale: 1,
                x: 0,
                y: 0,
                duration: 0.62,
                ease: "power3.out",
              },
              0.12,
            )
            .fromTo(
              ".novacar-intro__pigment--body",
              { autoAlpha: 0, scale: 1.035, clipPath: "inset(47% 0 47% 0)" },
              {
                autoAlpha: 0.88,
                scale: 1,
                clipPath: "inset(0% 0 0% 0)",
                duration: 0.5,
                ease: "expo.inOut",
              },
              0.2,
            )
            .fromTo(
              ".novacar-intro__mark",
              { autoAlpha: 0, scale: 0.992 },
              {
                autoAlpha: 1,
                scale: 1,
                duration: 0.38,
                ease: "power2.out",
              },
              0.52,
            )
            .to(
              ".novacar-intro__pigment--coarse, .novacar-intro__pigment--fine",
              { autoAlpha: 0, scale: 0.985, duration: 0.34, ease: "power2.out" },
              0.64,
            )
            .to(
              ".novacar-intro__pigment--body",
              { autoAlpha: 0, duration: 0.26, ease: "none" },
              0.72,
            )
            .fromTo(
              ".novacar-intro__axis",
              { autoAlpha: 0, scaleX: 0 },
              { autoAlpha: 1, scaleX: 1, duration: 0.16, ease: "power2.inOut" },
              1.22,
            )
            .to(
              ".novacar-intro__stage",
              { autoAlpha: 0, scaleX: 0.91, scaleY: 0.02, duration: 0.18, ease: "power2.inOut" },
              1.3,
            )
            .to(
              ".novacar-intro__panel--top",
              { yPercent: -101, duration: 0.38, ease: "power3.inOut" },
              1.42,
            )
            .to(
              ".novacar-intro__panel--bottom",
              { yPercent: 101, duration: 0.38, ease: "power3.inOut" },
              1.42,
            )
            .to(
              ".novacar-intro__axis",
              { autoAlpha: 0, duration: 0.2, ease: "none" },
              1.42,
            );
        }, animationScope);
      } catch {
        finish();
      }
    }

    void runTimeline();

    return () => {
      disposed = true;
      window.clearTimeout(failOpenTimer);
      preference.removeEventListener("change", onPreferenceChange);
      gsapContext?.revert();
      document.documentElement.classList.remove("novacar-intro-active");
    };
  }, [play, visible]);

  if (!visible) return null;

  return (
    <div ref={overlayRef} className="novacar-intro" aria-hidden="true">
      <div className="novacar-intro__panel novacar-intro__panel--top" />
      <div className="novacar-intro__panel novacar-intro__panel--bottom" />

      <div className="novacar-intro__stage">
        <div className="novacar-intro__pigment novacar-intro__pigment--coarse" />
        <div className="novacar-intro__pigment novacar-intro__pigment--fine" />
        <div className="novacar-intro__pigment novacar-intro__pigment--body" />
        <img className="novacar-intro__mark" src="/novacar-mark.svg" alt="" />
      </div>

      <div className="novacar-intro__axis" />
    </div>
  );
}
