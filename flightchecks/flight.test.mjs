import assert from "node:assert/strict";
import { test } from "node:test";
import { runPlan } from "./runner.mjs";

const plan = {"claims":[{"id":"c_38c0810f62","kind":"file_exists","occurrences":[{"location":{"endOffset":345,"kind":"file","lineEnd":6,"lineStart":6,"path":"README.md","sourceId":"readme_266147490538","startOffset":334},"quote":"SECURITY.md"}],"params":{"path":"SECURITY.md"},"sourceId":"readme_266147490538","tier":"static"},{"id":"c_3b5c167f99","kind":"script_exists","occurrences":[{"location":{"endOffset":2814,"kind":"file","lineEnd":47,"lineStart":47,"path":"README.md","sourceId":"readme_266147490538","startOffset":2806},"quote":"npm test"}],"params":{"script":"test"},"sourceId":"readme_266147490538","tier":"static"},{"id":"c_8c28244c22","kind":"file_exists","occurrences":[{"location":{"endOffset":319,"kind":"file","lineEnd":6,"lineStart":6,"path":"README.md","sourceId":"readme_266147490538","startOffset":309},"quote":"PRIVACY.md"},{"location":{"endOffset":1895,"kind":"file","lineEnd":33,"lineStart":33,"path":"README.md","sourceId":"readme_266147490538","startOffset":1885},"quote":"PRIVACY.md"}],"params":{"path":"PRIVACY.md"},"sourceId":"readme_266147490538","tier":"static"},{"id":"c_aef8ff0be3","kind":"file_exists","occurrences":[{"location":{"endOffset":295,"kind":"file","lineEnd":6,"lineStart":6,"path":"README.md","sourceId":"readme_266147490538","startOffset":288},"quote":"LICENSE"}],"params":{"path":"LICENSE"},"sourceId":"readme_266147490538","tier":"static"},{"id":"c_bdf0298482","kind":"file_exists","occurrences":[{"location":{"endOffset":3010,"kind":"file","lineEnd":49,"lineStart":49,"path":"README.md","sourceId":"readme_266147490538","startOffset":2995},"quote":"CONTRIBUTING.md"},{"location":{"endOffset":3027,"kind":"file","lineEnd":49,"lineStart":49,"path":"README.md","sourceId":"readme_266147490538","startOffset":3012},"quote":"CONTRIBUTING.md"}],"params":{"path":"CONTRIBUTING.md"},"sourceId":"readme_266147490538","tier":"static"},{"id":"c_f23f0d0ccd","kind":"file_exists","occurrences":[{"location":{"endOffset":579,"kind":"file","lineEnd":14,"lineStart":10,"path":"README.md","sourceId":"readme_266147490538","startOffset":566},"quote":"manifest.json"},{"location":{"endOffset":2203,"kind":"file","lineEnd":37,"lineStart":37,"path":"README.md","sourceId":"readme_266147490538","startOffset":2190},"quote":"manifest.json"}],"params":{"path":"manifest.json"},"sourceId":"readme_266147490538","tier":"static"}],"repo":"huss2342/canvas-zip-preview","sourceHashes":{"readme_266147490538":"dd8c50f1793d8d33039d2e83afcc757a6bb451dc96414fcbd655b9459bf69184"}};
const results = await runPlan(plan);
const byIndex = plan.claims.map((claim) => results[claim.id]);

test("README.md:6  SECURITY.md", { skip: byIndex[0]?.status === "unverified" || byIndex[0]?.status === "skipped" }, () => {
  const result = byIndex[0];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

test("README.md:47  npm test", { skip: byIndex[1]?.status === "unverified" || byIndex[1]?.status === "skipped" }, () => {
  const result = byIndex[1];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

test("README.md:6  PRIVACY.md", { skip: byIndex[2]?.status === "unverified" || byIndex[2]?.status === "skipped" }, () => {
  const result = byIndex[2];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

test("README.md:6  LICENSE", { skip: byIndex[3]?.status === "unverified" || byIndex[3]?.status === "skipped" }, () => {
  const result = byIndex[3];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

test("README.md:49  CONTRIBUTING.md", { skip: byIndex[4]?.status === "unverified" || byIndex[4]?.status === "skipped" }, () => {
  const result = byIndex[4];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

test("README.md:10  manifest.json", { skip: byIndex[5]?.status === "unverified" || byIndex[5]?.status === "skipped" }, () => {
  const result = byIndex[5];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

