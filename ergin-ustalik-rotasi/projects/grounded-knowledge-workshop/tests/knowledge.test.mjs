import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { evaluateQuery, findSources, groundedAnswer, tokenize, validateAnswerShape } from "../src/knowledge.js";

const sources = JSON.parse(await readFile(new URL("../data/sources.json", import.meta.url), "utf8"));

test("tokenization normalizes Turkish letters", () => {
  assert.deepEqual(tokenize("Bir görev ve bellek"), ["gorev", "bellek"]);
});

test("retrieval returns a relevant source with identity", () => {
  const hits = findSources("asyncio görev iptali", sources);
  assert.ok(hits.some((source) => source.id === "PY-ASYNC-001"));
});

test("grounded answer includes traceable citations and passes schema", () => {
  const answer = groundedAnswer("profiling CPU ölçümü ve bellek", sources);
  assert.equal(answer.status, "grounded");
  assert.ok(answer.citations.some((citation) => citation.id === "PY-PROFILE-001"));
  assert.equal(validateAnswerShape(answer), true);
});

test("unsupported query does not fabricate a source", () => {
  const answer = groundedAnswer("quantum banana teleportation", sources);
  assert.equal(answer.status, "insufficient_evidence");
  assert.equal(answer.citations.length, 0);
  assert.equal(validateAnswerShape(answer), true);
});

test("malformed or unsafe citation output is rejected", () => {
  assert.equal(validateAnswerShape({ status: "grounded", citations: [], answer: "x" }), false);
  assert.equal(validateAnswerShape({ schemaVersion: "1.0", status: "grounded", answer: "x", retrievedCount: 1, citations: [{id:"x",title:"x",url:"javascript:alert(1)"}] }), false);
});

test("evaluation computes source recall against expected ids", () => {
  const result = evaluateQuery("asyncio görev iptali", sources, ["PY-ASYNC-001"]);
  assert.equal(result.validShape, true);
  assert.equal(result.sourceRecall, 1);
});
