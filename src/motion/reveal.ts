import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Never pre-hide off-screen content. Only render a from-state when its timeline
 * starts. Native intersection and focus provide fallbacks independently of ST.
 */
export function createRevealController(root: HTMLElement, seen = new WeakSet<Element>()) {
  const entries = new Map<Element, { play: (finish?: boolean) => void; dispose: () => void }>();
  const observer = typeof IntersectionObserver === "undefined" ? undefined : new IntersectionObserver((records) => {
    records.forEach((record) => {
      if (record.isIntersecting) entries.get(record.target)?.play();
    });
  }, { rootMargin: "0px 0px -4% 0px" });

  const watch = (element: HTMLElement, timeline: gsap.core.Timeline) => {
    entries.get(element)?.dispose();
    const alreadySeen = seen.has(element);
    let started = false;
    let watchdog = 0;
    const play = (finish = false) => {
      if (!started) {
        started = true;
        seen.add(element);
        observer?.unobserve(element);
        timeline.play();
        watchdog = window.setTimeout(() => timeline.progress(1), timeline.duration() * 1000 + 400);
      }
      if (finish) timeline.progress(1);
    };
    const trigger = ScrollTrigger.create({
      trigger: element,
      start: "clamp(top 96%)",
      once: true,
      onEnter: () => play(),
      onEnterBack: () => play(),
    });
    const dispose = () => {
      clearTimeout(watchdog);
      observer?.unobserve(element);
      trigger.kill();
      timeline.kill();
    };
    entries.set(element, { play, dispose });
    const rect = element.getBoundingClientRect();
    if (alreadySeen || rect.top < 0) play(true);
    else if (rect.top < window.innerHeight * 0.96) play();
    else observer?.observe(element);
  };

  const focus = (event: FocusEvent) => {
    if (!(event.target instanceof Node)) return;
    entries.forEach((entry, element) => {
      if (element.contains(event.target as Node)) entry.play(true);
    });
  };
  root.addEventListener("focusin", focus);

  return {
    watch,
    destroy() {
      observer?.disconnect();
      root.removeEventListener("focusin", focus);
      entries.forEach((entry) => entry.dispose());
      entries.clear();
    },
  };
}

export type RevealController = ReturnType<typeof createRevealController>;

export function entranceTimeline() {
  return gsap.timeline({
    paused: true,
    defaults: { duration: 0.65, ease: "power3.out", immediateRender: false },
  });
}

export const settle = "opacity,transform,clipPath";

/** Apply every staggered start-state together, but only at timeline playback. */
export function addReveal(
  timeline: gsap.core.Timeline,
  targets: gsap.TweenTarget,
  from: { opacity?: number; y?: number; yPercent?: number; clipPath?: string },
  options: gsap.TweenVars = {},
  position = 0,
) {
  timeline.set(targets, { ...from, immediateRender: false }, 0);
  timeline.to(targets, {
    ...(from.opacity !== undefined ? { opacity: 1 } : {}),
    ...(from.y !== undefined ? { y: 0 } : {}),
    ...(from.yPercent !== undefined ? { yPercent: 0 } : {}),
    ...(from.clipPath !== undefined ? { clipPath: "inset(0% 0% 0% 0%)" } : {}),
    clearProps: settle,
    ...options,
  }, position);
  return timeline;
}
