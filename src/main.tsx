import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "lenis/dist/lenis.css";
import "../styles.css";
import IntroOverlay, { consumeIntroSession } from "./components/IntroOverlay";
import { normalizePath, resolveRoute } from "./routes";

const RootPage = resolveRoute(normalizePath(window.location.pathname));
const playIntro = consumeIntroSession();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IntroOverlay play={playIntro} />
    <RootPage />
  </StrictMode>,
);
