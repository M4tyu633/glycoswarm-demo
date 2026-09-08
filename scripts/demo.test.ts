import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { converge, reconstruct } from "../src/demo/engine.ts";

const data = JSON.parse(readFileSync(new URL("../src/demo/source-data.json", import.meta.url), "utf8"));
test("source contracts preserve their exact inputs for every sample", () => {
  for (const sample of data.samples) for (const contract of data.contracts) {
    const result = reconstruct(sample, contract, data.cohort, false);
    assert.deepEqual(Object.keys(result.input_labs), contract.fields);
    for (const field of contract.fields) assert.equal(result.input_labs[field], sample[field]);
    assert.equal(result.used_llm, false);
    assert.deepEqual(result, reconstruct(sample, contract, data.cohort, false));
  }
});
test("all sixteen provider availability combinations preserve missing evidence", () => {
  for (let mask = 0; mask < 16; mask++) {
    const results = data.contracts.map((c: typeof data.contracts[number], i: number) => reconstruct(data.samples[0], c, data.cohort, !!(mask & (1 << i))));
    const summary = converge(results);
    assert.equal(summary.evidence_count, results.filter((r: { available: boolean }) => r.available).length);
    assert.equal(summary.recommendation, null);
    for (const result of results) if (!result.available) {
      assert.equal(result.risk_score, null);
      assert.equal(result.flag, null);
      assert.ok(summary.missing.includes(result.specialist));
      assert.notEqual(summary.leading_demo_branch, result.specialist);
    }
    if (mask === 15) { assert.equal(summary.available, false); assert.equal(summary.leading_demo_branch, null); }
  }
});
