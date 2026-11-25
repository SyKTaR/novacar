import { describe, test } from "node:test";
import assert from "node:assert/strict";

type Entry = { hash: string; lastmod: string };
const sitemapModulePath = "../scripts/" + "sitemap.mjs";
const { contentFingerprint, updateLastmods, buildSitemapXml, todayInParis } = (await import(sitemapModulePath)) as {
  contentFingerprint: (html: string) => string;
  updateLastmods: (
    pages: { path: string; html: string }[],
    manifest: Record<string, Entry>,
    today?: string,
  ) => { manifest: Record<string, Entry>; changed: string[] };
  buildSitemapXml: (origin: string, manifest: Record<string, Entry>) => string;
  todayInParis: (now?: Date) => string;
};

const page = ({ main = "Texte", header = "Menu", asset = "index-AAA.js", title = "Titre" } = {}) =>
  `<html><head><title>${title}</title><meta name="description" content="Desc" />` +
  `<script src="/assets/${asset}"></script></head><body><header>${header}</header>` +
  `<main id="main-content"><h1>${main}</h1></main><footer>Pied</footer></body></html>`;

describe("empreinte de contenu", () => {
  test("ignore header, footer et noms d'assets", () => {
    assert.equal(contentFingerprint(page()), contentFingerprint(page({ header: "Autre menu", asset: "index-BBB.js" })));
  });

  test("change avec le texte de <main> ou le title", () => {
    assert.notEqual(contentFingerprint(page()), contentFingerprint(page({ main: "Nouveau texte" })));
    assert.notEqual(contentFingerprint(page()), contentFingerprint(page({ title: "Autre titre" })));
  });
});

describe("lastmod", () => {
  test("conserve la date si le contenu n'a pas changé, sinon prend la date du jour", () => {
    const html = page();
    const manifest = { "/": { hash: contentFingerprint(html), lastmod: "2026-11-16" } };
    const same = updateLastmods([{ path: "/", html }], manifest, "2026-12-01");
    assert.equal(same.manifest["/"].lastmod, "2026-11-16");
    assert.deepEqual(same.changed, []);

    const edited = updateLastmods([{ path: "/", html: page({ main: "Modifié" }) }], manifest, "2026-12-01");
    assert.equal(edited.manifest["/"].lastmod, "2026-12-01");
    assert.deepEqual(edited.changed, ["/"]);
  });

  test("une page retirée du site disparaît du manifeste", () => {
    const manifest = { "/ancienne": { hash: "x", lastmod: "2026-01-01" } };
    const result = updateLastmods([{ path: "/", html: page() }], manifest, "2026-12-01");
    assert.deepEqual(Object.keys(result.manifest), ["/"]);
  });

  test("date au format AAAA-MM-JJ, heure de Paris", () => {
    // 23 h 30 UTC le 31/12 = 0 h 30 le 01/01 à Paris.
    assert.equal(todayInParis(new Date("2026-12-31T23:30:00Z")), "2027-01-01");
  });

  test("XML de sitemap", () => {
    const xml = buildSitemapXml("https://www.nova-car.fr", { "/": { hash: "x", lastmod: "2026-11-16" } });
    assert.match(xml, /<loc>https:\/\/www\.nova-car\.fr\/<\/loc>\s*<lastmod>2026-11-16<\/lastmod>/);
  });
});
