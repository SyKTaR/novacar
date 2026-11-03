import gsap from "gsap";
import { addReveal, entranceTimeline } from "./reveal";

export const INTRO_COMPLETE_EVENT = "novacar:intro-complete";

export function createHeroMotion(root: HTMLElement, desktop: boolean, state: { played: boolean }) {
  const select = gsap.utils.selector(root);
  const timeline = entranceTimeline();
  addReveal(timeline, select(".hero-kicker"), { opacity: 0, y: 10 }, { ease: "expo.out" });
  addReveal(timeline, select(".motion-word"), { yPercent: 105 }, {
    duration: 0.7, stagger: { amount: 0.18 }, ease: "expo.out", clearProps: "transform",
  }, 0.04);
  addReveal(timeline, select(".hero-copy"), { opacity: 0, y: 12 }, {}, 0.18);
  addReveal(timeline, select(".hero-actions"), { opacity: 0, y: 10 }, {}, 0.26);

  let played = false;
  let finishTimer = 0;
  const start = () => {
    if (played) return;
    played = true;
    // Restored scroll and incoming anchors should never replay a hidden hero.
    if (state.played || window.scrollY > 80 || window.location.hash) timeline.progress(1);
    else timeline.play();
    state.played = true;
    finishTimer = window.setTimeout(() => timeline.progress(1), 1500);
  };
  const focus = () => { start(); timeline.progress(1); };
  root.querySelector(".hero")?.addEventListener("focusin", focus);
  window.addEventListener(INTRO_COMPLETE_EVENT, start, { once: true });
  if (!document.documentElement.classList.contains("novacar-intro-active")) start();
  // Independent fallback if the overlay's completion event is lost.
  const failOpen = window.setTimeout(start, 2500);

  if (desktop) {
    gsap.fromTo(select(".hero-media video"), { yPercent: -2, scale: 1.08 }, {
      yPercent: 2, scale: 1.08, ease: "none",
      scrollTrigger: { trigger: root.querySelector(".hero"), start: "top top", end: "bottom top", scrub: 0.6 },
    });
  }

  return () => {
    clearTimeout(failOpen);
    clearTimeout(finishTimer);
    window.removeEventListener(INTRO_COMPLETE_EVENT, start);
    root.querySelector(".hero")?.removeEventListener("focusin", focus);
  };
}
