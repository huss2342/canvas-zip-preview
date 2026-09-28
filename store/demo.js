// Synthetic ZIP and minimal browser APIs for the listing screenshot only.
// This file is excluded from the extension package.
const demoEntries = [
  ["src/", ""],
  ["src/parser.js", "export function parseRecord(line) {\n  const [name, score] = line.split(',');\n  return { name: name.trim(), score: Number(score) };\n}\n\nconsole.log(parseRecord('Example, 95'));\n"],
  ["src/format.js", "export const formatScore = (value) => `${value}%`;\n"],
  ["tests/parser.test.js", "import { parseRecord } from '../src/parser.js';\n// Synthetic test file\n"],
  ["README.md", "# Data Parser\nA synthetic sample submission for store screenshots.\n"]
];

function makeDemoZip(entries) {
  const encoder = new TextEncoder();
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const [name, contents] of entries) {
    const filename = encoder.encode(name);
    const data = encoder.encode(contents);
    const crc = CanvasZipReader.crc32Of(data);
    const local = new Uint8Array(30 + filename.length + data.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, filename.length, true);
    local.set(filename, 30);
    local.set(data, 30 + filename.length);
    locals.push(local);

    const central = new Uint8Array(46 + filename.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 0x0314, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, filename.length, true);
    cv.setUint32(38, name.endsWith("/") ? 0x41ed0000 : 0x81a40000, true);
    cv.setUint32(42, offset, true);
    central.set(filename, 46);
    centrals.push(central);
    offset += local.length;
  }
  const centralLength = centrals.reduce((total, value) => total + value.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralLength, true);
  ev.setUint32(16, offset, true);
  const all = [...locals, ...centrals, end];
  const result = new Uint8Array(all.reduce((total, value) => total + value.length, 0));
  let at = 0;
  for (const part of all) { result.set(part, at); at += part.length; }
  return result;
}

const demoZip = makeDemoZip(demoEntries);
const originalFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = async (url, options) => {
  if (String(url).includes("/files/42/download")) {
    return new Response(demoZip.slice(), {
      status: 200,
      headers: { "content-length": String(demoZip.length), "content-type": "application/zip" }
    });
  }
  return originalFetch(url, options);
};
globalThis.chrome = {
  storage: { local: {
    get: async () => ({ preferredPreviewWindowSize: "large" }),
    set: async () => {}
  } }
};

async function showDemo() {
  const trigger = document.querySelector(".czp-preview-button");
  if (!trigger) { requestAnimationFrame(showDemo); return; }
  trigger.click();
  const waitForRows = () => {
    const parser = [...document.querySelectorAll(".czp-file-row")]
      .find((row) => row.dataset.name === "src/parser.js");
    if (!parser) { requestAnimationFrame(waitForRows); return; }
    parser.click();
    document.body.dataset.demoReady = "true";
  };
  requestAnimationFrame(waitForRows);
}
if (!location.search.includes("button-only")) {
  window.addEventListener("load", () => requestAnimationFrame(showDemo));
}
