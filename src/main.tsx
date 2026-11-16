import { StrictMode, useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import "lenis/dist/lenis.css";
import "../styles.css";
import IntroOverlay, { consumeIntroSession } from "./components/IntroOverlay";
import CookieConsent from "./components/CookieConsent";
import { normalizePath, resolveRoute } from "./routes";

const RootPage = resolveRoute(normalizePath(window.location.pathname));
const playIntro = consumeIntroSession();

function Root() {
  const [introVisible, setIntroVisible] = useState(playIntro);
  const finishIntro = useCallback(() => setIntroVisible(false), []);

  return (
    <>
      <IntroOverlay play={playIntro} onFinish={finishIntro} />
      <div inert={introVisible || undefined} aria-hidden={introVisible || undefined}>
        <RootPage />
        <CookieConsent />
      </div>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
