import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

/**
 * Sitemap généré au build (appelé par scripts/prerender.mjs).
 *
 * `lastmod` = date du dernier changement réel du contenu de la page, et non la
 * date du build. Le contenu est résumé par une empreinte (title + meta
 * description + texte de <main>) : le header, le footer, le CSS et les noms de
 * fichiers hachés n'entrent pas dans le calcul, pour qu'une retouche de style
 * ne fasse pas croire à Google que toutes les pages ont changé.
 *
 * Les empreintes et leurs dates sont conservées dans
 * scripts/sitemap-lastmod.json (fichier à commiter). Quand l'empreinte d'une
 * page change, le build inscrit la date du jour (heure de Paris) et met le
 * fichier à jour : il suffit de commiter ce fichier avec la modification de
 * contenu. S'il n'est pas commité, le build Vercel retombe sur la date du
 * déploiement pour les pages modifiées, ce qui reste exact à un jour près.
 */

export const LASTMOD_FILE = "scripts/sitemap-lastmod.json";

function decodeEntities(text) {
  return text
    .replace(/&nbsp;|&#160;|&#xa0;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'");
}

/** Texte significatif d'une page prérendue (indépendant du markup et des assets). */
export function contentFingerprint(html) {
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "";
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
  const main = html.match(/<main[\s>][\s\S]*<\/main>/)?.[0] ?? "";
  const mainText = main
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|template)[\s\S]*?<\/\1>/g, " ")
    .replace(/<[^>]+>/g, " ");
  const normalized = decodeEntities(`${title}\n${description}\n${mainText}`).replace(/\s+/g, " ").trim();
  return createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}

export function todayInParis(now = new Date()) {
  // en-CA formate en AAAA-MM-JJ.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(now);
}

export async function readLastmodManifest() {
  try {
    return JSON.parse(await readFile(LASTMOD_FILE, "utf8"));
  } catch {
    return {};
  }
}

/**
 * @param {{ path: string, html: string }[]} pages pages indexables uniquement
 * @param {Record<string, { hash: string, lastmod: string }>} manifest
 * @returns {{ manifest: Record<string, { hash: string, lastmod: string }>, changed: string[] }}
 */
export function updateLastmods(pages, manifest, today = todayInParis()) {
  const next = {};
  const changed = [];
  for (const { path, html } of pages) {
    const hash = contentFingerprint(html);
    const previous = manifest[path];
    if (previous && previous.hash === hash) {
      next[path] = previous;
    } else {
      next[path] = { hash, lastmod: today };
      changed.push(path);
    }
  }
  return { manifest: next, changed };
}

export function buildSitemapXml(origin, manifest) {
  const urls = Object.entries(manifest)
    .map(([path, { lastmod }]) => `  <url>\n    <loc>${origin}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export async function writeLastmodManifest(manifest) {
  await writeFile(LASTMOD_FILE, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}
