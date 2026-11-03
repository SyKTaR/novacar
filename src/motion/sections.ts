import gsap from "gsap";
import { createServicesMotion } from "./services";
import { SplitText } from "gsap/SplitText";
import { addReveal, entranceTimeline, type RevealController } from "./reveal";
import { createContactMotion } from "./contact";

gsap.registerPlugin(SplitText);

export function createSectionMotion(root: HTMLElement, desktop: boolean, reveals: RevealController, context: gsap.Context) {
  const select = (selector: string, scope: Element = root) => Array.from(scope.querySelectorAll<HTMLElement>(selector));
  const restorers: Array<() => void> = [];

  // Heading lines reflow when fonts load or width changes; returning the timeline
  // lets SplitText revert/recreate it safely inside the matchMedia context.
  select(".partners-header, .realisations-header, .faq-header, .contact-intro").forEach((header) => {
    const title = header.querySelector<HTMLElement>("h2");
    if (!title) return;
    SplitText.create(title, {
      type: "lines",
      tag: "span",
      mask: "lines",
      linesClass: "motion-line",
      autoSplit: true,
      onSplit(split) {
        const timeline = entranceTimeline();
        const eyebrow = header.matches(".realisations-header") ? null : header.querySelector<HTMLElement>(":scope > p:first-child");
        const copy = header.querySelector<HTMLElement>(".faq-intro, .realisations-intro, .contact-copy");
        if (eyebrow) addReveal(timeline, eyebrow, { opacity: 0, y: 8 });
        addReveal(timeline, split.lines, { yPercent: 105 }, { stagger: 0.06, clearProps: "transform", ease: "expo.out" }, 0.06);
        if (copy) addReveal(timeline, copy, { opacity: 0, y: 10 }, {}, 0.16);
        reveals.watch(header, timeline);
        return timeline;
      },
    });
  });

  select(".stats-grid").forEach((grid) => {
    const timeline = addReveal(entranceTimeline(), grid, { opacity: 0, y: 18 }, { duration: 0.7 });
    const vertical = select(".stats-divider", grid);
    const horizontal = select(".stats-row-divider", grid);
    timeline.set(vertical, { scaleY: 0, transformOrigin: "center" }, 0);
    timeline.set(horizontal, { scaleX: 0, transformOrigin: "center" }, 0);
    timeline.to(vertical, { scaleY: 1, duration: 0.55, ease: "power3.out", clearProps: "transform" }, 0.2);
    timeline.to(horizontal, { scaleX: 1, duration: 0.55, ease: "power3.out", clearProps: "transform" }, 0.2);
    select(".stats-value", grid).forEach((value) => {
      const original = value.textContent;
      const label = value.getAttribute("aria-label");
      const target = Number(value.dataset.value);
      const suffix = value.dataset.suffix ?? "";
      const counter = { value: 0 };
      value.setAttribute("aria-label", original ?? "");
      timeline.to(counter, {
        value: target, duration: 1, ease: "power3.out",
        onUpdate: () => { value.textContent = `${Math.round(counter.value)}${suffix}`; },
        onComplete: () => { value.textContent = original; },
      }, 0.12);
      restorers.push(() => {
        value.textContent = original;
        if (label === null) value.removeAttribute("aria-label");
        else value.setAttribute("aria-label", label);
      });
    });
    reveals.watch(grid, timeline);
  });

  select(".partners-marquee").forEach((marquee) => {
    const track = marquee.querySelector<HTMLElement>(".partners-track");
    const group = marquee.querySelector<HTMLElement>(".partners-group");
    if (!track || !group) return;
    let loop: gsap.core.Tween | undefined;
    let hovering = false;
    const rebuild = () => {
      const progress = loop?.progress() ?? 0;
      loop?.kill();
      const distance = group.getBoundingClientRect().width;
      if (!distance) return;
      gsap.set(track, { x: -distance * progress });
      loop = gsap.fromTo(track, { x: 0 }, {
        x: -distance, duration: distance / 50, ease: "none", repeat: -1,
      });
      loop.progress(progress);
      if (hovering) loop.pause();
    };
    const pause = () => { hovering = true; loop?.pause(); };
    const resume = () => { hovering = false; loop?.resume(); };
    const observer = new ResizeObserver(rebuild);
    observer.observe(group);
    rebuild();
    marquee.addEventListener("mouseenter", pause);
    marquee.addEventListener("mouseleave", resume);
    marquee.addEventListener("focusin", pause);
    marquee.addEventListener("focusout", resume);
    restorers.push(() => {
      observer.disconnect();
      marquee.removeEventListener("mouseenter", pause);
      marquee.removeEventListener("mouseleave", resume);
      marquee.removeEventListener("focusin", pause);
      marquee.removeEventListener("focusout", resume);
      loop?.kill();
      gsap.set(track, { clearProps: "transform" });
    });
  });

  restorers.push(createServicesMotion(root, desktop, reveals, context));

  select(".realisation-item").forEach((item, index) => {
    const timeline = entranceTimeline();
    addReveal(timeline, select(".realisation-name, .realisation-category, .realisation-description", item), { opacity: 0, y: 10 }, { stagger: 0.045 }, 0.12);
    const media = item.querySelector<HTMLElement>(".realisation-media");
    if (media) {
      // Never animate the after layer's clip-path; the toggle owns it.
      addReveal(timeline, media, { opacity: 0, y: 18 }, { duration: 0.7 }, 0);
    }
    timeline.delay(0.5 + index * 0.1);
    reveals.watch(item, timeline);
  });

  // The FAQ's button/region disclosure remains interactive during its reveal.
  select(".faq-item").forEach((item) => {
    reveals.watch(item, addReveal(entranceTimeline(), item, { opacity: 0, y: 10 }));
  });

  createContactMotion(root, reveals);

  select(".footer-main, .footer-bottom").forEach((block) => {
    reveals.watch(block, addReveal(entranceTimeline(), block, { opacity: 0, y: 12 }));
  });

  return () => restorers.forEach((restore) => restore());
}
