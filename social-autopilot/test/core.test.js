import assert from "node:assert/strict";
import test from "node:test";
import { bufferPostMetadata, gqlString, modelText, nextEditorialDate, parisLocalToUtc, parseJsonObject, selectChannels, toParisLocalInput } from "../src/core.js";

test("gqlString échappe le contenu utilisateur", () => {
  assert.equal(gqlString('Bonjour "Marseille"\n'), '"Bonjour \\"Marseille\\"\\n"');
});

test("bufferPostMetadata configure les publications image par plateforme", () => {
  assert.equal(bufferPostMetadata("instagram", "Texte"), "metadata: { instagram: { type: post, shouldShareToFeed: true } }");
  assert.equal(bufferPostMetadata("instagram", "Texte", "reel"), "metadata: { instagram: { type: reel, shouldShareToFeed: true } }");
  assert.match(bufferPostMetadata("tiktok", "Titre photo"), /metadata: \{ tiktok: \{ title: "Titre photo" \} \}/);
  assert.equal(bufferPostMetadata("twitter", "Texte"), "");
});

test("parseJsonObject accepte un bloc Markdown", () => {
  assert.deepEqual(parseJsonObject('```json\n{"hook":"Salut"}\n```'), { hook: "Salut" });
});

test("modelText lit le format chat completion moderne", () => {
  assert.equal(modelText({ choices: [{ message: { content: "bonjour" } }] }), "bonjour");
  assert.equal(modelText({ response: { hook: "bonjour" } }), '{"hook":"bonjour"}');
});

test("selectChannels détecte les trois services", () => {
  const selected = selectChannels([
    { id: "1", service: "instagram" },
    { id: "2", service: "tiktok" },
    { id: "3", service: "twitter" },
  ]);
  assert.equal(selected.twitter.id, "3");
});

test("selectChannels refuse une configuration incomplète", () => {
  assert.throws(() => selectChannels([{ id: "1", service: "instagram" }]), /tiktok, twitter/);
});

test("nextEditorialDate choisit mardi, jeudi ou samedi à 17:15 UTC", () => {
  assert.equal(nextEditorialDate(new Date("2026-09-14T12:00:00Z")), "2026-09-15T17:15:00.000Z");
});

test("nextEditorialDate conserve 19:15 à Paris en heure d'hiver", () => {
  assert.equal(nextEditorialDate(new Date("2026-12-02T12:00:00Z")), "2026-12-03T18:15:00.000Z");
});

test("parisLocalToUtc gère les heures été et hiver", () => {
  assert.equal(parisLocalToUtc("2026-09-15T19:15"), "2026-09-15T17:15:00.000Z");
  assert.equal(parisLocalToUtc("2026-12-03T19:15"), "2026-12-03T18:15:00.000Z");
});

test("toParisLocalInput prépare la valeur datetime-local", () => {
  assert.equal(toParisLocalInput("2026-09-15T17:15:00.000Z"), "2026-09-15T19:15");
});
