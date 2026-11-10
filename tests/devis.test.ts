/**
 * Tests du handler api/devis.ts — `fetch` global mocké : aucun appel réel à Brevo.
 * Lancer : node --test tests/devis.test.ts   (Node ≥ 22.18, type stripping natif)
 */
import { afterEach, beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import { POST, GET, resetRateLimit, isAllowedOrigin } from "../api/devis.ts";

const ORIGIN = "https://nova-car.fr";
// Clés factices, uniquement pour ces tests.
const FAKE_KEY = "test-fake-key-not-a-secret";

// JPEG minimal valide pour la signature (FF D8 FF E0 …).
const jpegBase64 = (size = 64) => {
  const bytes = Buffer.alloc(size, 1);
  bytes[0] = 0xff;
  bytes[1] = 0xd8;
  bytes[2] = 0xff;
  bytes[3] = 0xe0;
  return bytes.toString("base64");
};

const validBody = (extra: Record<string, unknown> = {}) => ({
  need: "jantes",
  vehicle: "Peugeot 3008",
  details: "Rayure sur la jante avant gauche",
  name: "Jean Dupont",
  phone: "06 12 34 56 78",
  email: "jean.dupont@example.com",
  consent: true,
  photos: [],
  ...extra,
});

let n = 0;
const req = (body: unknown, headers: Record<string, string> = {}, raw?: string) =>
  new Request("https://nova-car.fr/api/devis", {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN, "x-real-ip": `10.0.0.${++n}`, ...headers },
    body: raw ?? JSON.stringify(body),
  });

interface Call {
  url: string;
  init: RequestInit;
  json: any;
}
let calls: Call[] = [];
let brevoStatus = 201;
const realFetch = globalThis.fetch;

beforeEach(() => {
  calls = [];
  brevoStatus = 201;
  resetRateLimit();
  process.env.BREVO_API_KEY = FAKE_KEY;
  process.env.QUOTE_TO_EMAIL = "to@example.com";
  process.env.QUOTE_FROM_EMAIL = "from@example.com";
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url: String(url), init, json: JSON.parse(String(init.body)) });
    return new Response(brevoStatus >= 400 ? `{"code":"secret_detail ${FAKE_KEY}"}` : '{"messageId":"x"}', { status: brevoStatus });
  }) as typeof fetch;
});
afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("api/devis", () => {
  test("succès : appel Brevo correct, en français, avec pièces jointes", async () => {
    const res = await POST(req(validBody({ photos: [jpegBase64(), jpegBase64(128)] })));
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
    assert.equal(calls.length, 1);
    const [{ url, init, json }] = calls;
    assert.equal(url, "https://api.brevo.com/v3/smtp/email");
    assert.equal((init.headers as Record<string, string>)["api-key"], FAKE_KEY);
    assert.deepEqual(json.sender, { name: "Site Novacar", email: "from@example.com" });
    assert.deepEqual(json.to, [{ email: "to@example.com" }]);
    assert.deepEqual(json.replyTo, { email: "jean.dupont@example.com", name: "Jean Dupont" });
    assert.equal(json.subject, "Nouvelle demande de devis — Jantes — Jean Dupont");
    assert.equal(json.attachment.length, 2);
    assert.equal(json.attachment[0].name, "photo-1.jpg");
    assert.equal(json.attachment[0].content, jpegBase64());
    assert.match(json.htmlContent, /Téléphone/);
    assert.match(json.textContent, /Téléphone : 06 12 34 56 78/);
    assert.match(json.textContent, /Photos jointes : 2/);
  });

  test("succès sans photo : pas de clé attachment", async () => {
    const res = await POST(req(validBody()));
    assert.equal(res.status, 200);
    assert.equal("attachment" in calls[0].json, false);
  });

  test("repli sans photos : l'e-mail signale les photos non jointes", async () => {
    const res = await POST(req(validBody({ photosSkipped: 2 })));
    assert.equal(res.status, 200);
    assert.match(calls[0].json.textContent, /2 photos sélectionnées par le client, mais non jointes/);
  });

  for (const [label, patch] of [
    ["nom trop court", { name: "J" }],
    ["téléphone invalide", { phone: "abc" }],
    ["e-mail invalide", { email: "pas-un-email" }],
    ["besoin inconnu", { need: "autre" }],
    ["consentement absent", { consent: false }],
    ["détails trop longs", { details: "x".repeat(2001) }],
    ["véhicule trop long", { vehicle: "x".repeat(121) }],
    ["types incorrects", { name: 42 }],
  ] as const) {
    test(`champ invalide → 400 : ${label}`, async () => {
      const res = await POST(req(validBody(patch)));
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.ok, false);
      assert.equal(typeof body.error, "string");
      assert.equal(calls.length, 0);
    });
  }

  test("JSON invalide → 400, mauvais Content-Type → 415", async () => {
    assert.equal((await POST(req(null, {}, "{pas du json"))).status, 400);
    assert.equal((await POST(req(validBody(), { "content-type": "text/plain" }))).status, 415);
    assert.equal(calls.length, 0);
  });

  test("honeypot : succès simulé, aucun envoi", async () => {
    const res = await POST(req(validBody({ botcheck: true })));
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
    assert.equal(calls.length, 0);
  });

  test("photo trop lourde → 413 ; photo non JPEG → 413 ; trop de photos → 413", async () => {
    const big = Buffer.alloc(2_600_000, 1);
    big[0] = 0xff;
    big[1] = 0xd8;
    big[2] = 0xff;
    assert.equal((await POST(req(validBody({ photos: [big.toString("base64")] })))).status, 413);
    const png = Buffer.from("89504e470d0a1a0a00000000", "hex").toString("base64");
    assert.equal((await POST(req(validBody({ photos: [png] })))).status, 413);
    assert.equal((await POST(req(validBody({ photos: Array(5).fill(jpegBase64()) })))).status, 413);
    // total > 3 Mo : 2 × 1,6 Mo
    const half = Buffer.alloc(1_600_000, 1);
    half[0] = 0xff;
    half[1] = 0xd8;
    half[2] = 0xff;
    assert.equal((await POST(req(validBody({ photos: [half.toString("base64"), half.toString("base64")] })))).status, 413);
    assert.equal(calls.length, 0);
  });

  test("corps total > 4,2 Mo → 413 (content-length et corps)", async () => {
    assert.equal((await POST(req(validBody(), { "content-length": "4300000" }))).status, 413);
    assert.equal((await POST(req(null, {}, JSON.stringify(validBody({ details: "x".repeat(4_300_000) }))))).status, 413);
  });

  test("origine refusée / absente → 403", async () => {
    for (const origin of ["https://evil.example", "https://nova-car.fr.evil.example", "https://evilvercel.app", "http://nova-car.fr", "null"]) {
      assert.equal((await POST(req(validBody(), { origin }))).status, 403, origin);
    }
    const noOrigin = new Request("https://nova-car.fr/api/devis", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validBody()),
    });
    assert.equal((await POST(noOrigin)).status, 403);
    assert.equal(calls.length, 0);
  });

  test("origines autorisées", () => {
    for (const o of ["https://nova-car.fr", "https://www.nova-car.fr", "https://novacar-bice.vercel.app", "http://localhost:5173", "http://127.0.0.1:3000"]) {
      assert.equal(isAllowedOrigin(o), true, o);
    }
  });

  test("échec Brevo → 502, aucune fuite de la clé ni du détail Brevo", async () => {
    brevoStatus = 401;
    const logged: string[] = [];
    const realError = console.error;
    console.error = (...args: unknown[]) => void logged.push(args.join(" "));
    const res = await POST(req(validBody()));
    console.error = realError;
    assert.equal(res.status, 502);
    const text = await res.text();
    assert.equal(JSON.parse(text).ok, false);
    assert.ok(!text.includes(FAKE_KEY) && !text.includes("secret_detail"));
    assert.ok(logged.length > 0); // détail en journal serveur
  });

  test("erreur réseau vers Brevo → 502", async () => {
    globalThis.fetch = (async () => {
      throw new Error("réseau coupé");
    }) as typeof fetch;
    const realError = console.error;
    console.error = () => undefined;
    const res = await POST(req(validBody()));
    console.error = realError;
    assert.equal(res.status, 502);
  });

  test("configuration manquante → 500 explicite côté journal, générique côté client", async () => {
    delete process.env.BREVO_API_KEY;
    const logged: string[] = [];
    const realError = console.error;
    console.error = (...args: unknown[]) => void logged.push(args.join(" "));
    const res = await POST(req(validBody()));
    console.error = realError;
    assert.equal(res.status, 500);
    assert.match(logged.join(" "), /BREVO_API_KEY/);
    assert.ok(!(await res.text()).includes("BREVO_API_KEY"));
    assert.equal(calls.length, 0);
  });

  test("échappement HTML de tout texte saisi", async () => {
    const xss = `<img src=x onerror=alert(1)>"&'`;
    const res = await POST(
      req(validBody({ name: `Jean <b>${xss}`, vehicle: `<script>alert(1)</script>`, details: `Ligne1\n<a href="javascript:alert(1)">clic</a>\n${xss}` })),
    );
    assert.equal(res.status, 200);
    const { htmlContent } = calls[0].json;
    assert.ok(!htmlContent.includes("<script"));
    assert.ok(!htmlContent.includes("<img"));
    assert.ok(!htmlContent.includes("<a href"));
    assert.ok(!htmlContent.includes("<b>Jean"));
    assert.match(htmlContent, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
    assert.match(htmlContent, /Ligne1<br>&lt;a href=&quot;javascript/);
    assert.match(htmlContent, /&amp;&#39;/);
  });

  test("sujet : pas de retour à la ligne injecté", async () => {
    await POST(req(validBody({ name: "Jean\r\nBcc: x@evil.example" })));
    assert.ok(!/[\r\n]/.test(calls[0].json.subject));
  });

  test("limitation de débit : 6e requête d'une même IP → 429", async () => {
    const headers = { "x-real-ip": "203.0.113.9" };
    for (let i = 0; i < 5; i++) assert.equal((await POST(req(validBody(), headers))).status, 200);
    const res = await POST(req(validBody(), headers));
    assert.equal(res.status, 429);
    assert.equal(res.headers.get("retry-after"), "600");
    assert.equal(calls.length, 5);
  });

  test("autres méthodes → 405", async () => {
    const res = await GET(new Request("https://nova-car.fr/api/devis"));
    assert.equal(res.status, 405);
    assert.equal(res.headers.get("allow"), "POST");
  });
});
