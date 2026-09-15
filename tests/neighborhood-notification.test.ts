import assert from "node:assert/strict";
import test from "node:test";

import { neighborhoodAvailableJob } from "../lib/email-automations";

test("neighborhood launch notifications are scoped and deduplicated per vote", () => {
  const job = neighborhoodAvailableJob({
    voteId: "vote-42",
    neighborhoodId: "neighborhood-7",
    neighborhoodName: "Noailles",
    slug: "noailles",
    email: "votant@example.com"
  });

  assert.equal(job.kind, "stock_back");
  assert.equal(job.recipient, "votant@example.com");
  assert.equal(job.dedupe_key, "neighborhood-available:neighborhood-7:vote-42");
  assert.match(job.subject, /Noailles/);
  assert.match(job.body, /\/quartier\/noailles/);
});
