// Soumission IndexNow (Bing, Yandex, Seznam, Naver…) des URL du sitemap.
// Voir docs/indexnow.md. Sans l'option --send, le script n'envoie rien :
// il affiche seulement la requête qui serait faite.
//
//   node scripts/indexnow.mjs                 # aperçu, sitemap de production
//   node scripts/indexnow.mjs --send          # envoi réel
//   node scripts/indexnow.mjs --send /renovation-jantes /   # seulement ces pages
import { readdir, readFile } from "node:fs/promises";

const HOST = "www.nova-car.fr";
const ORIGIN = `https://${HOST}`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

const args = process.argv.slice(2);
const send = args.includes("--send");
const paths = args.filter((arg) => arg.startsWith("/"));

// La clé est le nom du fichier public/<clé>.txt (32 caractères hexadécimaux).
const keyFile = (await readdir("public")).find((name) => /^[a-f0-9]{32}\.txt$/.test(name));
if (!keyFile) throw new Error("Fichier de clé IndexNow introuvable dans public/.");
const key = keyFile.replace(/\.txt$/, "");
if ((await readFile(`public/${keyFile}`, "utf8")).trim() !== key) {
  throw new Error(`Le contenu de public/${keyFile} doit être exactement la clé.`);
}

// Sitemap du dernier build local (dist/) s'il existe, sinon celui de la production.
async function sitemapUrls() {
  let xml;
  try {
    xml = await readFile("dist/sitemap.xml", "utf8");
  } catch {
    const response = await fetch(`${ORIGIN}/sitemap.xml`);
    if (!response.ok) throw new Error(`sitemap.xml : HTTP ${response.status}`);
    xml = await response.text();
  }
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

const urlList = paths.length ? paths.map((path) => `${ORIGIN}${path}`) : await sitemapUrls();
const body = { host: HOST, key, keyLocation: `${ORIGIN}/${keyFile}`, urlList };

if (!send) {
  console.log("Aperçu (rien n'est envoyé, ajouter --send) :");
  console.log(`POST ${ENDPOINT}`);
  console.log(JSON.stringify(body, null, 2));
  process.exit(0);
}

const response = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});
// 200 = reçu, 202 = reçu (clé en cours de vérification). 403 = clé non trouvée sur le site.
console.log(`IndexNow : HTTP ${response.status} pour ${urlList.length} URL`);
if (response.status >= 300) process.exit(1);
