import assert from "node:assert/strict";
import test from "node:test";

import { isCatalogStatusVotable } from "../lib/constants";

test("only neighborhoods still at idea stage accept votes", () => {
  assert.equal(isCatalogStatusVotable("idea"), true);
  assert.equal(isCatalogStatusVotable("project"), false);
  assert.equal(isCatalogStatusVotable("available"), false);
});
