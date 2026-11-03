import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { createHeroMotion } from "./hero";
import { createRevealController } from "./reveal";
import { createSectionMotion } from "./sections";
import { createHeaderMotion } from "./header";

// This entire module is dynamically imported by usePageMotion (never during SSR).
gsap.registerPlugin(ScrollTrigger);

export function createPageMotion(root: HTMLElement) {
  const media = gsap.matchMedia();
  const seen = new WeakSet<Element>();
  const heroState = { played: false };
  let alive = true;
  let refreshTimer = 0;
  const refresh = () => {
    if (!alive) return;
    clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      if (alive) ScrollTrigger.refresh();
    }, 120);
  };
  root.addEventListener("load", refresh, true);
  root.addEventListener("toggle", refresh, true);
  root.addEventListener("novacar:layout", refresh);
  document.fonts.addEventListener("loadingdone", refresh);
  void document.fonts.ready.then(refresh);

  // React creates the page client-side even in preview. Resolve initial anchors
  // once after mount, independently of motion preferences and font loading.
  const anchorFrame = requestAnimationFrame(() => {
    if (window.location.hash) {
      let id: string;
      try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
      const target = document.getElementById(id);
      if (target && root.contains(target)) target.scrollIntoView({ behavior: "instant", block: "start" });
    }
    refresh();
  });

  const cleanup = () => {
    alive = false;
    clearTimeout(refreshTimer);
    cancelAnimationFrame(anchorFrame);
    root.removeEventListener("load", refresh, true);
    root.removeEventListener("toggle", refresh, true);
    root.removeEventListener("novacar:layout", refresh);
    document.fonts.removeEventListener("loadingdone", refresh);
    media.revert();
  };

  try {
    media.add({
      desktop: "(min-width: 62rem)",
      mobile: "(max-width: 61.999rem)",
      reduced: "(prefers-reduced-motion: reduce)",
    }, (context) => {
      if (context.conditions?.reduced) { heroState.played = true; return; }
      const disposers: Array<() => void> = [];
      const dispose = () => disposers.reverse().forEach((fn) => fn());
      try {
        const desktop = Boolean(context.conditions?.desktop);
        disposers.push(createHeroMotion(root, desktop, heroState));
        const reveals = createRevealController(root, seen);
        disposers.push(() => reveals.destroy());
        disposers.push(createSectionMotion(root, desktop, reveals, context));
        createHeaderMotion(root);
        const lenis = new Lenis({ anchors: true });
        window.__lenis = lenis;
        if (document.body.classList.contains("menu-open")) lenis.stop();
        lenis.on("scroll", ScrollTrigger.update);
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        disposers.push(() => {
          gsap.ticker.remove(tick);
          lenis.off("scroll", ScrollTrigger.update);
          lenis.destroy();
          if (window.__lenis === lenis) window.__lenis = undefined;
        });
        return dispose;
      } catch (error) {
        dispose();
        throw error;
      }
    }, root);
  } catch (error) {
    cleanup();
    throw error;
  }
  return cleanup;
}
