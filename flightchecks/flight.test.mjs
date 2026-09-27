import assert from "node:assert/strict";
import { test } from "node:test";
import { runPlan } from "./runner.mjs";

const plan = {"claims":[{"id":"c_079a1cec5f","kind":"script_exists","occurrences":[{"location":{"endOffset":2791,"kind":"file","lineEnd":47,"lineStart":47,"path":"README.md","sourceId":"readme_8f6b06164083","startOffset":2783},"quote":"npm test"}],"params":{"script":"test"},"sourceId":"readme_8f6b06164083","tier":"static"},{"id":"c_1284e1d38e","kind":"file_exists","occurrences":[{"location":{"endOffset":319,"kind":"file","lineEnd":6,"lineStart":6,"path":"README.md","sourceId":"readme_8f6b06164083","startOffset":309},"quote":"PRIVACY.md"},{"location":{"endOffset":1872,"kind":"file","lineEnd":33,"lineStart":33,"path":"README.md","sourceId":"readme_8f6b06164083","startOffset":1862},"quote":"PRIVACY.md"}],"params":{"path":"PRIVACY.md"},"sourceId":"readme_8f6b06164083","tier":"static"},{"id":"c_36afdecd75","kind":"file_exists","occurrences":[{"location":{"endOffset":557,"kind":"file","lineEnd":14,"lineStart":10,"path":"README.md","sourceId":"readme_266147490538","startOffset":537},"quote":"canvas_extension_zip"}],"params":{"path":"canvas_extension_zip"},"sourceId":"readme_266147490538","tier":"static"},{"id":"c_38c0810f62","kind":"file_exists","occurrences":[{"location":{"endOffset":345,"kind":"file","lineEnd":6,"lineStart":6,"path":"README.md","sourceId":"readme_266147490538","startOffset":334},"quote":"SECURITY.md"}],"params":{"path":"SECURITY.md"},"sourceId":"readme_266147490538","tier":"static"},{"id":"c_3b5c167f99","kind":"script_exists","occurrences":[{"location":{"endOffset":2791,"kind":"file","lineEnd":47,"lineStart":47,"path":"README.md","sourceId":"readme_266147490538","startOffset":2783},"quote":"npm test"}],"params":{"script":"test"},"sourceId":"readme_266147490538","tier":"static"},{"id":"c_55d281e691","kind":"file_exists","occurrences":[{"location":{"endOffset":2180,"kind":"file","lineEnd":37,"lineStart":37,"path":"README.md","sourceId":"readme_8f6b06164083","startOffset":2167},"quote":"manifest.json"}],"params":{"path":"manifest.json"},"sourceId":"readme_8f6b06164083","tier":"static"},{"id":"c_59921925ed","kind":"file_exists","occurrences":[{"location":{"endOffset":2987,"kind":"file","lineEnd":49,"lineStart":49,"path":"README.md","sourceId":"readme_8f6b06164083","startOffset":2972},"quote":"CONTRIBUTING.md"},{"location":{"endOffset":3004,"kind":"file","lineEnd":49,"lineStart":49,"path":"README.md","sourceId":"readme_8f6b06164083","startOffset":2989},"quote":"CONTRIBUTING.md"}],"params":{"path":"CONTRIBUTING.md"},"sourceId":"readme_8f6b06164083","tier":"static"},{"id":"c_6fb2cdf6c6","kind":"file_exists","occurrences":[{"location":{"endOffset":345,"kind":"file","lineEnd":6,"lineStart":6,"path":"README.md","sourceId":"readme_8f6b06164083","startOffset":334},"quote":"SECURITY.md"}],"params":{"path":"SECURITY.md"},"sourceId":"readme_8f6b06164083","tier":"static"},{"id":"c_8c28244c22","kind":"file_exists","occurrences":[{"location":{"endOffset":319,"kind":"file","lineEnd":6,"lineStart":6,"path":"README.md","sourceId":"readme_266147490538","startOffset":309},"quote":"PRIVACY.md"},{"location":{"endOffset":1872,"kind":"file","lineEnd":33,"lineStart":33,"path":"README.md","sourceId":"readme_266147490538","startOffset":1862},"quote":"PRIVACY.md"}],"params":{"path":"PRIVACY.md"},"sourceId":"readme_266147490538","tier":"static"},{"id":"c_aef8ff0be3","kind":"file_exists","occurrences":[{"location":{"endOffset":295,"kind":"file","lineEnd":6,"lineStart":6,"path":"README.md","sourceId":"readme_266147490538","startOffset":288},"quote":"LICENSE"}],"params":{"path":"LICENSE"},"sourceId":"readme_266147490538","tier":"static"},{"id":"c_b94edf98c3","kind":"file_exists","occurrences":[{"location":{"endOffset":557,"kind":"file","lineEnd":14,"lineStart":10,"path":"README.md","sourceId":"readme_8f6b06164083","startOffset":537},"quote":"canvas_extension_zip"}],"params":{"path":"canvas_extension_zip"},"sourceId":"readme_8f6b06164083","tier":"static"},{"id":"c_bdf0298482","kind":"file_exists","occurrences":[{"location":{"endOffset":2987,"kind":"file","lineEnd":49,"lineStart":49,"path":"README.md","sourceId":"readme_266147490538","startOffset":2972},"quote":"CONTRIBUTING.md"},{"location":{"endOffset":3004,"kind":"file","lineEnd":49,"lineStart":49,"path":"README.md","sourceId":"readme_266147490538","startOffset":2989},"quote":"CONTRIBUTING.md"}],"params":{"path":"CONTRIBUTING.md"},"sourceId":"readme_266147490538","tier":"static"},{"id":"c_f15db08428","kind":"file_exists","occurrences":[{"location":{"endOffset":295,"kind":"file","lineEnd":6,"lineStart":6,"path":"README.md","sourceId":"readme_8f6b06164083","startOffset":288},"quote":"LICENSE"}],"params":{"path":"LICENSE"},"sourceId":"readme_8f6b06164083","tier":"static"},{"id":"c_f23f0d0ccd","kind":"file_exists","occurrences":[{"location":{"endOffset":2180,"kind":"file","lineEnd":37,"lineStart":37,"path":"README.md","sourceId":"readme_266147490538","startOffset":2167},"quote":"manifest.json"}],"params":{"path":"manifest.json"},"sourceId":"readme_266147490538","tier":"static"}],"repo":"huss2342/canvas-zip-preview","sourceHashes":{"readme_266147490538":"3e9b2a5dd193984630a3ea681d03c2a44984f9acbd6e64f02c8a3510b099f43a","readme_8f6b06164083":"3e9b2a5dd193984630a3ea681d03c2a44984f9acbd6e64f02c8a3510b099f43a"}};
const results = await runPlan(plan);
const byIndex = plan.claims.map((claim) => results[claim.id]);

test("README.md:47  npm test", { skip: byIndex[0]?.status === "unverified" || byIndex[0]?.status === "skipped" }, () => {
  const result = byIndex[0];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

test("README.md:6  PRIVACY.md", { skip: byIndex[1]?.status === "unverified" || byIndex[1]?.status === "skipped" }, () => {
  const result = byIndex[1];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

test("README.md:10  canvas_extension_zip", { skip: byIndex[2]?.status === "unverified" || byIndex[2]?.status === "skipped" }, () => {
  const result = byIndex[2];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

test("README.md:6  SECURITY.md", { skip: byIndex[3]?.status === "unverified" || byIndex[3]?.status === "skipped" }, () => {
  const result = byIndex[3];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

test("README.md:47  npm test", { skip: byIndex[4]?.status === "unverified" || byIndex[4]?.status === "skipped" }, () => {
  const result = byIndex[4];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

test("README.md:37  manifest.json", { skip: byIndex[5]?.status === "unverified" || byIndex[5]?.status === "skipped" }, () => {
  const result = byIndex[5];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

test("README.md:49  CONTRIBUTING.md", { skip: byIndex[6]?.status === "unverified" || byIndex[6]?.status === "skipped" }, () => {
  const result = byIndex[6];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

test("README.md:6  SECURITY.md", { skip: byIndex[7]?.status === "unverified" || byIndex[7]?.status === "skipped" }, () => {
  const result = byIndex[7];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

test("README.md:6  PRIVACY.md", { skip: byIndex[8]?.status === "unverified" || byIndex[8]?.status === "skipped" }, () => {
  const result = byIndex[8];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

test("README.md:6  LICENSE", { skip: byIndex[9]?.status === "unverified" || byIndex[9]?.status === "skipped" }, () => {
  const result = byIndex[9];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

test("README.md:10  canvas_extension_zip", { skip: byIndex[10]?.status === "unverified" || byIndex[10]?.status === "skipped" }, () => {
  const result = byIndex[10];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

test("README.md:49  CONTRIBUTING.md", { skip: byIndex[11]?.status === "unverified" || byIndex[11]?.status === "skipped" }, () => {
  const result = byIndex[11];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

test("README.md:6  LICENSE", { skip: byIndex[12]?.status === "unverified" || byIndex[12]?.status === "skipped" }, () => {
  const result = byIndex[12];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

test("README.md:37  manifest.json", { skip: byIndex[13]?.status === "unverified" || byIndex[13]?.status === "skipped" }, () => {
  const result = byIndex[13];
  assert.ok(result, "Runner returned no result");
  assert.ok(result.status === "pass" || result.status === "flaky", [result.expected, result.actual].join("\n"));
});

