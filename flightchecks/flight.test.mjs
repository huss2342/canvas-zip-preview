import assert from "node:assert/strict";
import { test } from "node:test";
import { runPlan } from "./runner.mjs";

const plan = {"claims":[{"id":"c_38c0810f62","kind":"file_exists","occurrences":[{"location":{"endOffset":345,"kind":"file","lineEnd":6,"lineStart":6,"path":"README.md","sourceId":"readme_266147490538","startOffset":334},"quote":"SECURITY.md"}],"params":{"path":"SECURITY.md"},"sourceId":"readme_266147490538","tier":"static"},{"id":"c_3b5c167f99","kind":"script_exists","occurrences":[{"location":{"endOffset":2923,"kind":"file","lineEnd":47,"lineStart":47,"path":"README.md","sourceId":"readme_266147490538","startOffset":2915},"quote":"npm test"}],"params":{"script":"test"},"sourceId":"readme_266147490538","tier":"static"},{"id":"c_55ead1bc93","kind":"file_exists","occurrences":[{"location":{"endOffset":3231,"kind":"file","lineEnd":49,"lineStart":49,"path":"README.md","sourceId":"readme_266147490538","startOffset":3218},"quote":"PUBLISHING.md"},{"location":{"endOffset":3246,"kind":"file","lineEnd":49,"lineStart":49,"path":"README.md","sourceId":"readme_266147490538","startOffset":3233},"quote":"PUBLISHING.md"}],"params":{"path":"PUBLISHING.md"},"sourceId":"readme_266147490538","tier":"static"},{"id":"c_8c28244c22","kind":"file_exists","occurrences":[{"location":{"endOffset":319,"kind":"file","lineEnd":6,"lineStart":6,"path":"README.md","sourceId":"readme_266147490538","startOffset":309},"quote":"PRIVACY.md"},{"location":{"endOffset":2004,"kind":"file","lineEnd":33,"lineStart":33,"path":"README.md","sourceId":"readme_266147490538","startOffset":1994},"quote":"PRIVACY.md"}],"params":{"path":"PRIVACY.md"},"sourceId":"readme_266147490538","tier":"static"},{"id":"c_a5bf9af71d","kind":"script_exists","occurrences":[{"location":{"endOffset":3085,"kind":"file","lineEnd":49,"lineStart":49,"path":"README.md","sourceId":"readme_266147490538","startOffset":3064},"quote":"npm run build:release"}],"params":{"script":"build:release"},"sourceId":"readme_266147490538","tier":"static"},{"id":"c_aef8ff0be3","kind":"file_exists","occurrences":[{"location":{"endOffset":295,"kind":"file","lineEnd":6,"lineStart":6,"path":"README.md","sourceId":"readme_266147490538","startOffset":288},"quote":"LICENSE"}],"params":{"path":"LICENSE"},"sourceId":"readme_266147490538","tier":"static"},{"id":"c_bdf0298482","kind":"file_exists","occurrences":[{"location":{"endOffset":3355,"kind":"file","lineEnd":51,"lineStart":51,"path":"README.md","sourceId":"readme_266147490538","startOffset":3340},"quote":"CONTRIBUTING.md"},{"location":{"endOffset":3372,"kind":"file","lineEnd":51,"lineStart":51,"path":"README.md","sourceId":"readme_266147490538","startOffset":3357},"quote":"CONTRIBUTING.md"}],"params":{"path":"CONTRIBUTING.md"},"sourceId":"readme_266147490538","tier":"static"},{"id":"c_f23f0d0ccd","kind":"file_exists","occurrences":[{"location":{"endOffset":579,"kind":"file","lineEnd":14,"lineStart":10,"path":"README.md","sourceId":"readme_266147490538","startOffset":566},"quote":"manifest.json"},{"location":{"endOffset":2312,"kind":"file","lineEnd":37,"lineStart":37,"path":"README.md","sourceId":"readme_266147490538","startOffset":2299},"quote":"manifest.json"}],"params":{"path":"manifest.json"},"sourceId":"readme_266147490538","tier":"static"}],"repo":"huss2342/canvas-zip-preview","sourceHashes":{"readme_266147490538":"796e25376b60d2464c4b051374e41a75bd2fe65f1a0951da3bbc3475bf49a037"}};
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

test("README.md:49  PUBLISHING.md", { skip: byIndex[2]?.status === "unverified" || byIndex[2]?.status === "skipped" }, () => {
  const result = byIndex[2];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

test("README.md:6  PRIVACY.md", { skip: byIndex[3]?.status === "unverified" || byIndex[3]?.status === "skipped" }, () => {
  const result = byIndex[3];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

test("README.md:49  npm run build:release", { skip: byIndex[4]?.status === "unverified" || byIndex[4]?.status === "skipped" }, () => {
  const result = byIndex[4];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

test("README.md:6  LICENSE", { skip: byIndex[5]?.status === "unverified" || byIndex[5]?.status === "skipped" }, () => {
  const result = byIndex[5];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

test("README.md:51  CONTRIBUTING.md", { skip: byIndex[6]?.status === "unverified" || byIndex[6]?.status === "skipped" }, () => {
  const result = byIndex[6];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

test("README.md:10  manifest.json", { skip: byIndex[7]?.status === "unverified" || byIndex[7]?.status === "skipped" }, () => {
  const result = byIndex[7];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

