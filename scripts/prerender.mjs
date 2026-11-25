import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  buildSeoHead,
  isIndexable,
  PRERENDER_ROUTES,
  render,
  SITE_ORIGIN,
} from "../.prerender/entry-server.js";
import {
  buildSitemapXml,
  readLastmodManifest,
  updateLastmods,
  writeLastmodManifest,
} from "./sitemap.mjs";

const DIST_DIR = "dist";
const template = await readFile(join(DIST_DIR, "index.html"), "utf8");
const seoRegion = /<!--seo:start-->[\s\S]*?<!--seo:end-->/;

if (!template.includes("<!--app-html-->") || !seoRegion.test(template)) {
  throw new Error("Les marqueurs de prerendering sont absents du HTML client.");
}

const indexablePages = [];

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
  if (isIndexable(route)) indexablePages.push({ path: route, html: pageHtml });
}

// Sitemap : uniquement les pages prérendues ET indexables (robots « index »).
// Les pages noindex (mentions légales, confidentialité, cookies, 404) en sont
// exclues automatiquement.
const previousManifest = await readLastmodManifest();
const { manifest, changed } = updateLastmods(indexablePages, previousManifest);
await writeFile(join(DIST_DIR, "sitemap.xml"), buildSitemapXml(SITE_ORIGIN, manifest), "utf8");
if (JSON.stringify(manifest) !== JSON.stringify(previousManifest)) {
  await writeLastmodManifest(manifest);
  console.log(`sitemap : lastmod mis à jour pour ${changed.join(", ") || "(pages retirées)"} → commiter scripts/sitemap-lastmod.json`);
}
console.log(`sitemap : ${indexablePages.length} URL indexables écrites dans dist/sitemap.xml`);

await rm(".prerender", { recursive: true, force: true });
