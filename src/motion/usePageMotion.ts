import { useEffect, type RefObject } from "react";

/** Only load the motion engine in the browser. Each StrictMode pass owns its cleanup. */
export function usePageMotion(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    void import("./pageMotion")
      .then(({ createPageMotion }) => {
        if (!disposed && ref.current) cleanup = createPageMotion(ref.current);
      })
      .catch((error: unknown) => {
        // The server-rendered page is visible without this enhancement.
        console.error("Novacar: motion unavailable; keeping static content.", error);
      });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [ref]);
}
