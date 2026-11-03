import gsap from "gsap";
import { addReveal, entranceTimeline, type RevealController } from "./reveal";

/** React owns selection/ARIA/inert; this enhancement only owns transient styles.
 * Called inside pageMotion's matchMedia context, never on the server or in the
 * reduced-motion branch. No extra React lifecycle or GSAP instance is needed. */
export function createServicesMotion(
  root: HTMLElement,
  desktop: boolean,
  reveals: RevealController,
  context: gsap.Context,
) {
  const section = root.querySelector<HTMLElement>(".services-v2");
  if (!section) return () => {};
  const select = (selector: string, scope: Element = section) => Array.from(scope.querySelectorAll<HTMLElement>(selector));
  const tabs = section.querySelector<HTMLElement>(".sv2-tabs")!;
  const indicator = section.querySelector<HTMLElement>(".sv2-tab-indicator")!;
  const panels = select(".sv2-panel");
  const stage = section.querySelector<HTMLElement>(".sv2-panels")!;
  const header = section.querySelector<HTMLElement>(".sv2-header")!;
  const footer = section.querySelector<HTMLElement>(".sv2-footer")!;

  const headerEntry = entranceTimeline();
  addReveal(headerEntry, select(".sv2-eyebrow, .sv2-header h2, .sv2-intro"), { opacity: 0, y: desktop ? 12 : 6 }, { stagger: .055, duration: .6, ease: "expo.out" });
  reveals.watch(header, headerEntry);
  const tabsEntry = addReveal(entranceTimeline(), tabs, { opacity: 0, y: 6 }, { duration: .45 });
  reveals.watch(tabs, tabsEntry);

  const contentEntry = entranceTimeline();
  addReveal(contentEntry, select(".sv2-card"), { opacity: 0, y: desktop ? 14 : 6 }, { duration: .55 });
  addReveal(contentEntry, select(".sv2-list-header"), { opacity: 0 }, { duration: .4 }, .05);
  // Each list has its own short stagger; inactive panels stay CSS-hidden.
  panels.forEach((panel) => {
    addReveal(contentEntry, select(".sv2-row", panel), { opacity: 0, y: desktop ? 12 : 5 }, { duration: .45, stagger: desktop ? .04 : .02 }, .08);
  });
  reveals.watch(stage, contentEntry);
  reveals.watch(footer, addReveal(entranceTimeline(), footer, { opacity: 0, y: 8 }, { duration: .5 }));

  let current = Number(section.dataset.activeIndex ?? 0);
  let transition: gsap.core.Timeline | undefined;
  let pill: gsap.core.Tween | undefined;
  let watchdog = 0;
  let disposed = false;
  const contentTargets = panels.map((panel) => select(".sv2-card-body, .sv2-list-header, .sv2-row", panel));
  const animatedTargets = [...panels, ...contentTargets.flat()];

  // Reset GSAP's percentage cache as well as the transform: the CSS fallback
  // already translates the pill to the currently selected tab.
  gsap.set(indicator, { x: 0, xPercent: current * 100 });

  const resetContent = () => {
    gsap.set(animatedTargets, { clearProps: "opacity,transform,visibility" });
  };
  const stopTransition = () => {
    clearTimeout(watchdog);
    transition?.kill();
    transition = undefined;
    resetContent();
  };

  // context.add keeps observer-created tweens in the existing matchMedia
  // lifecycle, including a preference change or StrictMode unmount.
  const change = context.add("changeServicesCategory", () => {
    if (disposed) return;
    const next = Number(section.dataset.activeIndex ?? 0);
    if (next === current || !panels[next]) return;
    const previous = current;
    current = next;
    // Complete entrance states before interactive transitions take ownership.
    headerEntry.progress(1);
    tabsEntry.progress(1);
    contentEntry.progress(1);
    stopTransition();
    pill?.kill();
    pill = gsap.to(indicator, { x: 0, xPercent: next * 100, duration: desktop ? .55 : .4, ease: "expo.out", overwrite: true });

    // The outgoing panel remains inert/aria-hidden even while dissolving.
    gsap.set(panels[previous], { visibility: "visible" });
    transition = gsap.timeline({
      defaults: { duration: desktop ? .45 : .35, ease: "power3.out" },
      onComplete: resetContent,
    });
    transition.to(contentTargets[previous], { opacity: 0, y: desktop ? -6 : -3, duration: .18 }, 0);
    transition.to(panels[previous], { opacity: 0, duration: .4 }, 0);
    // Panels share a grid cell: their photos crossfade in place, with no scale
    // or translation. Text gets a separate, small stagger.
    transition.fromTo(panels[next], { opacity: 0 }, { opacity: 1 }, 0);
    transition.fromTo(contentTargets[next], { opacity: 0, y: desktop ? 10 : 4 }, {
      opacity: 1, y: 0, stagger: desktop ? .035 : .018,
    }, .06);
    // Independent fail-open if a browser suspends GSAP during a tab switch.
    watchdog = window.setTimeout(() => transition?.progress(1), 1100);
  });
  const observer = new MutationObserver(() => change());
  observer.observe(section, { attributes: true, attributeFilter: ["data-active-index"] });

  // Keyboard focus must never land on a fading link. Selection still remains
  // entirely controlled by React (including clicks before motion is loaded).
  const finishOnFocus = context.add("finishServicesFocus", (event: FocusEvent) => {
    if (event.target instanceof Node && stage.contains(event.target)) {
      transition?.progress(1);
      clearTimeout(watchdog);
    }
  });
  section.addEventListener("focusin", finishOnFocus as EventListener);

  return () => {
    disposed = true;
    observer.disconnect();
    section.removeEventListener("focusin", finishOnFocus as EventListener);
    clearTimeout(watchdog);
    transition?.kill();
    pill?.kill();
    // MatchMedia reverts its tweens before this cleanup. Explicitly remove
    // transient overrides so CSS immediately reflects React's latest selection.
    for (const target of animatedTargets) {
      target.style.removeProperty("opacity");
      target.style.removeProperty("transform");
      target.style.removeProperty("visibility");
    }
    indicator.style.removeProperty("transform");
  };
}
