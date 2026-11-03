import gsap from "gsap";

/** React owns the selected state; each effect owns and cleans up its two tweens. */
export function animateRealisationToggle(layer: HTMLElement, thumb: HTMLElement, isAfter: boolean) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clipPath = isAfter ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)";
  const xPercent = isAfter ? 100 : 0;
  if (reduced) {
    gsap.set(layer, { clipPath });
    gsap.set(thumb, { xPercent });
    return () => {};
  }
  const wipe = gsap.to(layer, { clipPath, duration: 0.65, ease: "expo.out", overwrite: true });
  const slide = gsap.to(thumb, { xPercent, duration: 0.45, ease: "power3.out", overwrite: true });
  return () => { wipe.kill(); slide.kill(); };
}
