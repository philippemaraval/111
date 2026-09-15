import assert from "node:assert/strict";
import test from "node:test";

import { getPublishedProductGallery } from "../lib/product-illustrations";

test("published neighborhood galleries expose four optimized product views", () => {
  for (const [name, slug] of [
    ["La Joliette", "la-joliette"],
    ["Cinq-Avenues", "cinq-avenues"],
    ["Notre-Dame-du-Mont", "notre-dame-du-mont"],
    ["Sainte-Anne", "sainte-anne"],
    ["Mazargues", "mazargues"]
  ]) {
    const gallery = getPublishedProductGallery(name);

    assert.equal(gallery?.length, 4);
    assert.deepEqual(
      gallery?.map((image) => image.url),
      [
        `/illustrations/${slug}-plat-dos.webp?v=webp-3`,
        `/illustrations/${slug}-plat-face.webp?v=webp-3`,
        `/illustrations/${slug}-porte-face.webp?v=webp-3`,
        `/illustrations/${slug}-porte-dos.webp?v=webp-3`
      ]
    );
  }
});

test("unpublished neighborhoods keep their configured fallback gallery", () => {
  assert.equal(getPublishedProductGallery("Noailles"), undefined);
});
