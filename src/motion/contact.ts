import { addReveal, entranceTimeline, type RevealController } from "./reveal";

/** Entrée de section : le titre/sous-titre sont gérés par SplitText (sections.ts), puis la carte. */
export function createContactMotion(root: HTMLElement, reveals: RevealController) {
  root.querySelectorAll<HTMLElement>(".quote-card").forEach((card) => {
    reveals.watch(card, addReveal(entranceTimeline(), card, { opacity: 0, y: 18 }, { duration: 0.7 }, 0.12));
  });
}
