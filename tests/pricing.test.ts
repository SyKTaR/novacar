import { describe, test } from "node:test";
import assert from "node:assert/strict";

type ServiceItem = {
  title: string;
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

  test("les packs leasing ont un prix de départ TTC", () => {
    const leasing = SERVICE_CATEGORIES.find((category) => category.id === "leasing");
    assert.ok(leasing);
    assert.deepEqual(leasing.items.map((item) => item.priceTtc), [159, 279, 399]);
  });
});
