import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateShipmentWeightGrams,
  calculateShippingPrice
} from "../lib/shipping";
import { getMysteryPackPrice, MYSTERY_PACK_PRICES_EUROS } from "../lib/constants";

test("mystery pack prices cover one to three shirts", () => {
  assert.deepEqual(MYSTERY_PACK_PRICES_EUROS, { 1: 20, 2: 35, 3: 45 });
  assert.equal(getMysteryPackPrice(1), 20);
  assert.equal(getMysteryPackPrice(2), 35);
  assert.equal(getMysteryPackPrice(3), 45);
  assert.equal(getMysteryPackPrice(0), null);
  assert.equal(getMysteryPackPrice(4), null);
});

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
