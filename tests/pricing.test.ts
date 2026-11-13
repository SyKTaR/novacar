import { describe, test } from "node:test";
import assert from "node:assert/strict";

type ServiceItem = {
  title: string;
  priceBeforeTax?: number;
  priceTtc: number | "Sur devis";
  unit?: string;
};

const servicesModulePath = "../src/data/" + "services.ts";
const { formatServicePrice, SERVICE_CATEGORIES } = await import(servicesModulePath) as {
  formatServicePrice: (item: ServiceItem) => string;
  SERVICE_CATEGORIES: Array<{ id: string; items: ServiceItem[] }>;
};

describe("tarifs publics TTC", () => {
  const items = SERVICE_CATEGORIES.flatMap((category) => category.items);

  test("chaque montant suit l’unique règle de conversion et d’arrondi", () => {
    const pricedItems = items.filter((item) => typeof item.priceTtc === "number");
    assert.ok(pricedItems.length > 0);

    for (const item of pricedItems) {
      assert.equal(typeof item.priceBeforeTax, "number", item.title);
      assert.equal(item.priceTtc, Math.round(item.priceBeforeTax! * 1.2), item.title);
    }
  });

  test("chaque montant public est présenté comme un prix de départ TTC", () => {
    for (const item of items) {
      const label = formatServicePrice(item);
      if (typeof item.priceTtc === "number") {
        assert.match(label, /^À partir de \d+ € TTC(?: \/ .+)?$/, item.title);
      } else {
        assert.equal(label, "Sur devis", item.title);
      }
    }
  });

  test("le pack de préparation leasing reste sans prix fixe", () => {
    const leasing = SERVICE_CATEGORIES.find((category) => category.id === "leasing");
    assert.ok(leasing);
    assert.equal(leasing.items.length, 1);
    assert.equal(leasing.items[0].priceTtc, "Sur devis");
  });
});
