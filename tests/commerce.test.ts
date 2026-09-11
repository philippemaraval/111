import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateShipmentWeightGrams,
  calculateShippingPrice
} from "../lib/shipping";

test("shipping rates stay aligned with the storefront policy", () => {
  assert.equal(calculateShippingPrice(59.99, "mondial-relay"), 4.99);
  assert.equal(calculateShippingPrice(59.99, "home"), 7.99);
  assert.equal(calculateShippingPrice(60, "mondial-relay"), 0);
  assert.equal(calculateShippingPrice(60, "home"), 4.99);
});

test("shipment weight includes packaging and every shirt", () => {
  assert.equal(calculateShipmentWeightGrams(0), 0);
  assert.equal(calculateShipmentWeightGrams(1), 250);
  assert.equal(calculateShipmentWeightGrams(3), 680);
});
