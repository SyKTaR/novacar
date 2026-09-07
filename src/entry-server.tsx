import { renderToString } from "react-dom/server";
import { resolveRoute } from "./routes";
export { PRERENDER_ROUTES } from "./routes";
export { buildSeoHead } from "./seo";

export function render(path: string) {
  const RootPage = resolveRoute(path);
  return renderToString(<RootPage />);
}
