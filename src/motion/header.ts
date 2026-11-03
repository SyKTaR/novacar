import gsap from "gsap";

/** A shadow establishes the sticky header without moving navigation or its menu. */
export function createHeaderMotion(root: HTMLElement) {
  const header = root.querySelector<HTMLElement>(".site-header");
  if (!header) return;
  gsap.fromTo(header, { "--motion-header-shadow": 0 }, {
    "--motion-header-shadow": 1,
    ease: "none",
    scrollTrigger: { start: 0, end: 120, scrub: true },
  });
}
