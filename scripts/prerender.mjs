import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  buildSeoHead,
  PRERENDER_ROUTES,
  render,
} from "../.prerender/entry-server.js";

const DIST_DIR = "dist";
const template = await readFile(join(DIST_DIR, "index.html"), "utf8");
const seoRegion = /<!--seo:start-->[\s\S]*?<!--seo:end-->/;

if (!template.includes("<!--app-html-->") || !seoRegion.test(template)) {
  throw new Error("Les marqueurs de prerendering sont absents du HTML client.");
}

for (const route of PRERENDER_ROUTES) {
  const pageHtml = template
    .replace(
      seoRegion,
      `<!--seo:start-->${buildSeoHead(route)}<!--seo:end-->`,
    )
    .replace("<!--app-html-->", render(route));
  // "/404" est écrit en `404.html` à la racine de `dist/` (et non dans un
  // dossier `404/`) : c'est le fichier que Vercel sert automatiquement pour
  // toute route inconnue d'un déploiement statique.
  const outputPath =
    route === "/"
      ? join(DIST_DIR, "index.html")
      : route === "/404"
        ? join(DIST_DIR, "404.html")
        : join(DIST_DIR, route.slice(1), "index.html");

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, pageHtml, "utf8");
}

await rm(".prerender", { recursive: true, force: true });
