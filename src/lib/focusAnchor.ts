export function focusAnchorTarget(id: string, fallback?: HTMLElement | null) {
  window.requestAnimationFrame(() => {
    const target = document.getElementById(id);
    if (!target) {
      fallback?.focus();
      return;
    }

    const previousTabIndex = target.getAttribute("tabindex");
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    target.addEventListener(
      "blur",
      () => {
        if (previousTabIndex === null) target.removeAttribute("tabindex");
        else target.setAttribute("tabindex", previousTabIndex);
      },
      { once: true },
    );
  });
}
