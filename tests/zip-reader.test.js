const test = require("node:test");
const assert = require("node:assert/strict");
const { deflateRawSync } = require("node:zlib");
const { ZipArchive, ZipFormatError, crc32Of, inspectPath } = require("../zip-reader.js");

test("parses nested stored files and extracts verified contents", async () => {
  const zip = makeStoredZip([
    { name: "src/", data: "" },
    { name: "src/hello.js", data: "console.log('hello');\n" },
    { name: "README.md", data: "# Example\n" }
  ]);
  const archive = new ZipArchive(toArrayBuffer(zip));

  assert.equal(archive.entries.length, 3);
  assert.equal(archive.entries[0].isDirectory, true);
  assert.equal(archive.entries[1].name, "src/hello.js");
  assert.equal(archive.entries[1].methodLabel, "Stored");
  assert.equal(archive.entries[1].depth, 1);
  const extracted = await archive.extract(archive.entries[1]);
  assert.equal(new TextDecoder().decode(extracted), "console.log('hello');\n");
});

test("detects unsafe archive paths", () => {
  assert.equal(inspectPath("safe/folder/file.txt").safe, true);
  assert.equal(inspectPath("../escape.txt").safe, false);
  assert.equal(inspectPath("C:\\Windows\\file.txt").safe, false);
  assert.equal(inspectPath("/absolute/file.txt").safe, false);
});

test("extracts normal Deflate-compressed files", async () => {
  const zip = makeZip([{ name: "results/output.txt", data: "regular expression\n".repeat(80), method: 8 }]);
  const archive = new ZipArchive(toArrayBuffer(zip));
  const entry = archive.entries[0];

  assert.equal(entry.methodLabel, "Deflate");
  assert.ok(entry.compressedSize < entry.uncompressedSize);
  const extracted = await archive.extract(entry);
  assert.equal(new TextDecoder().decode(extracted), "regular expression\n".repeat(80));
});

test("rejects non-ZIP and truncated input", () => {
  assert.throws(() => new ZipArchive(toArrayBuffer(Buffer.from("not a zip"))), ZipFormatError);
  const valid = makeStoredZip([{ name: "a.txt", data: "abc" }]);
  assert.throws(() => new ZipArchive(toArrayBuffer(valid.subarray(0, valid.length - 10))), ZipFormatError);
});

function makeStoredZip(files) {
  return makeZip(files.map((file) => ({ ...file, method: 0 })));
}

function makeZip(files) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.name, "utf8");
    const data = Buffer.from(file.data, "utf8");
    const compressed = file.method === 8 ? deflateRawSync(data) : data;
    const crc = crc32Of(data);
    const local = Buffer.alloc(30 + name.length + compressed.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(file.method, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    name.copy(local, 30);
    compressed.copy(local, 30 + name.length);
    locals.push(local);

    const central = Buffer.alloc(46 + name.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(0x0314, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(file.method, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(file.name.endsWith("/") ? 0x41ed0000 : 0x81a40000, 38);
    central.writeUInt32LE(offset, 42);
    name.copy(central, 46);
    centrals.push(central);
    offset += local.length;
  }
  const centralSize = centrals.reduce((sum, value) => sum + value.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, ...centrals, end]);
}

function toArrayBuffer(buffer) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}
