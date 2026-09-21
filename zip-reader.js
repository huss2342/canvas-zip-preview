(function exposeCanvasZipReader(global) {
  "use strict";

  const SIGNATURE = {
    LOCAL_FILE: 0x04034b50,
    CENTRAL_FILE: 0x02014b50,
    END: 0x06054b50,
    ZIP64_END: 0x06064b50,
    ZIP64_LOCATOR: 0x07064b50
  };
  const MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);
  const CP437_HIGH = "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤ÁÂÀ©╣║╗╝¢¥┐└┴┬├─┼ãÃ╚╔╩╦╠═╬¤ðÐÊËÈıÍÎÏ┘┌█▄¦Ì▀ÓßÔÒõÕµþÞÚÛÙýÝ¯´≡±‗¾¶§÷¸°¨·¹³²■ ";

  class ZipFormatError extends Error {
    constructor(message) {
      super(message);
      this.name = "ZipFormatError";
    }
  }

  class ZipArchive {
    constructor(arrayBuffer) {
      if (!(arrayBuffer instanceof ArrayBuffer)) throw new TypeError("ZIP data must be an ArrayBuffer.");
      this.buffer = arrayBuffer;
      this.bytes = new Uint8Array(arrayBuffer);
      this.view = new DataView(arrayBuffer);
      this.entries = [];
      this.comment = "";
      this._parse();
    }

    _parse() {
      if (this.bytes.length < 22) throw new ZipFormatError("This file is too small to be a ZIP archive.");
      const endOffset = findEndRecord(this.view);
      if (endOffset < 0) throw new ZipFormatError("The ZIP directory could not be found. The file may be incomplete or unsupported.");

      const commentLength = this.view.getUint16(endOffset + 20, true);
      this.comment = decodeBytes(this.bytes.subarray(endOffset + 22, endOffset + 22 + commentLength), true);

      let entryCount = this.view.getUint16(endOffset + 10, true);
      let centralOffset = this.view.getUint32(endOffset + 16, true);

      if (entryCount === 0xffff || centralOffset === 0xffffffff) {
        const zip64 = readZip64Directory(this.view, endOffset);
        entryCount = zip64.entryCount;
        centralOffset = zip64.centralOffset;
      }

      let cursor = centralOffset;
      for (let index = 0; index < entryCount; index += 1) {
        ensureRange(this.view, cursor, 46, "central directory entry");
        if (this.view.getUint32(cursor, true) !== SIGNATURE.CENTRAL_FILE) {
          throw new ZipFormatError(`Invalid central directory entry at byte ${cursor}.`);
        }

        const flags = this.view.getUint16(cursor + 8, true);
        const method = this.view.getUint16(cursor + 10, true);
        const modifiedTime = this.view.getUint16(cursor + 12, true);
        const modifiedDate = this.view.getUint16(cursor + 14, true);
        const crc32 = this.view.getUint32(cursor + 16, true);
        let compressedSize = this.view.getUint32(cursor + 20, true);
        let uncompressedSize = this.view.getUint32(cursor + 24, true);
        const nameLength = this.view.getUint16(cursor + 28, true);
        const extraLength = this.view.getUint16(cursor + 30, true);
        const fileCommentLength = this.view.getUint16(cursor + 32, true);
        const diskNumber = this.view.getUint16(cursor + 34, true);
        const externalAttributes = this.view.getUint32(cursor + 38, true);
        let localOffset = this.view.getUint32(cursor + 42, true);
        const variableLength = nameLength + extraLength + fileCommentLength;
        ensureRange(this.view, cursor + 46, variableLength, "central directory data");

        const utf8 = Boolean(flags & 0x0800);
        const nameStart = cursor + 46;
        const extraStart = nameStart + nameLength;
        const commentStart = extraStart + extraLength;
        const name = decodeBytes(this.bytes.subarray(nameStart, extraStart), utf8);
        const extraBytes = this.bytes.subarray(extraStart, commentStart);
        const comment = decodeBytes(this.bytes.subarray(commentStart, commentStart + fileCommentLength), utf8);

        if (uncompressedSize === 0xffffffff || compressedSize === 0xffffffff || localOffset === 0xffffffff || diskNumber === 0xffff) {
          const values = readZip64Extra(extraBytes, {
            uncompressed: uncompressedSize === 0xffffffff,
            compressed: compressedSize === 0xffffffff,
            offset: localOffset === 0xffffffff,
            disk: diskNumber === 0xffff
          });
          if (values.uncompressed !== undefined) uncompressedSize = values.uncompressed;
          if (values.compressed !== undefined) compressedSize = values.compressed;
          if (values.offset !== undefined) localOffset = values.offset;
        }

        const unixMode = externalAttributes >>> 16;
        const isDirectory = name.endsWith("/") || (unixMode & 0xf000) === 0x4000;
        const pathSafety = inspectPath(name);
        this.entries.push({
          index,
          name,
          basename: name.replace(/\/$/, "").split("/").pop() || name,
          comment,
          flags,
          encrypted: Boolean(flags & 0x0001),
          method,
          methodLabel: compressionMethodName(method),
          crc32,
          crcHex: crc32.toString(16).padStart(8, "0").toUpperCase(),
          compressedSize,
          uncompressedSize,
          modified: dosDateTime(modifiedDate, modifiedTime),
          localOffset,
          externalAttributes,
          unixMode,
          isDirectory,
          pathSafety,
          depth: Math.max(0, name.replace(/\/$/, "").split("/").length - 1)
        });
        cursor += 46 + variableLength;
      }
    }

    async extract(entry, maxBytes = 2 * 1024 * 1024) {
      if (!entry || entry.isDirectory) throw new ZipFormatError("Directories do not contain previewable data.");
      if (entry.encrypted) throw new ZipFormatError("This entry is encrypted and cannot be previewed.");
      if (entry.uncompressedSize > maxBytes) {
        throw new ZipFormatError(`This file is larger than the ${formatBytes(maxBytes)} preview limit.`);
      }

      ensureRange(this.view, entry.localOffset, 30, "local file header");
      if (this.view.getUint32(entry.localOffset, true) !== SIGNATURE.LOCAL_FILE) {
        throw new ZipFormatError("The local file header is invalid.");
      }
      const nameLength = this.view.getUint16(entry.localOffset + 26, true);
      const extraLength = this.view.getUint16(entry.localOffset + 28, true);
      const dataStart = entry.localOffset + 30 + nameLength + extraLength;
      ensureRange(this.view, dataStart, entry.compressedSize, "compressed file data");
      const compressed = this.bytes.subarray(dataStart, dataStart + entry.compressedSize);

      let output;
      if (entry.method === 0) {
        output = compressed.slice();
      } else if (entry.method === 8) {
        output = await inflateRawWithLimit(compressed, maxBytes);
      } else {
        throw new ZipFormatError(`${entry.methodLabel} entries cannot be previewed in this version.`);
      }

      if (output.byteLength !== entry.uncompressedSize) {
        throw new ZipFormatError("The extracted size does not match the ZIP directory.");
      }
      if (crc32Of(output) !== entry.crc32) {
        throw new ZipFormatError("The file failed its CRC-32 integrity check.");
      }
      return output;
    }
  }

  function findEndRecord(view) {
    const earliest = Math.max(0, view.byteLength - 22 - 0xffff);
    for (let offset = view.byteLength - 22; offset >= earliest; offset -= 1) {
      if (view.getUint32(offset, true) === SIGNATURE.END) return offset;
    }
    return -1;
  }

  function readZip64Directory(view, endOffset) {
    const locatorOffset = endOffset - 20;
    ensureRange(view, locatorOffset, 20, "ZIP64 locator");
    if (view.getUint32(locatorOffset, true) !== SIGNATURE.ZIP64_LOCATOR) {
      throw new ZipFormatError("ZIP64 metadata is missing.");
    }
    const recordOffset = bigintToNumber(view.getBigUint64(locatorOffset + 8, true), "ZIP64 directory offset");
    ensureRange(view, recordOffset, 56, "ZIP64 end record");
    if (view.getUint32(recordOffset, true) !== SIGNATURE.ZIP64_END) {
      throw new ZipFormatError("The ZIP64 directory record is invalid.");
    }
    return {
      entryCount: bigintToNumber(view.getBigUint64(recordOffset + 32, true), "ZIP64 entry count"),
      centralOffset: bigintToNumber(view.getBigUint64(recordOffset + 48, true), "ZIP64 central directory offset")
    };
  }

  function readZip64Extra(bytes, needed) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let cursor = 0;
    while (cursor + 4 <= bytes.length) {
      const id = view.getUint16(cursor, true);
      const length = view.getUint16(cursor + 2, true);
      if (cursor + 4 + length > bytes.length) break;
      if (id === 0x0001) {
        let valueOffset = cursor + 4;
        const result = {};
        for (const [key, isNeeded] of Object.entries(needed)) {
          if (!isNeeded) continue;
          const width = key === "disk" ? 4 : 8;
          if (valueOffset + width > cursor + 4 + length) throw new ZipFormatError("ZIP64 extra data is incomplete.");
          result[key] = width === 8
            ? bigintToNumber(view.getBigUint64(valueOffset, true), `ZIP64 ${key}`)
            : view.getUint32(valueOffset, true);
          valueOffset += width;
        }
        return result;
      }
      cursor += 4 + length;
    }
    throw new ZipFormatError("The required ZIP64 size data is missing.");
  }

  async function inflateRawWithLimit(compressed, maxBytes) {
    if (typeof DecompressionStream === "undefined") {
      throw new ZipFormatError("This Chrome version cannot decompress ZIP previews.");
    }
    let stream;
    try {
      stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    } catch {
      throw new ZipFormatError("This Chrome version does not support raw DEFLATE streams.");
    }
    const reader = stream.getReader();
    const chunks = [];
    let total = 0;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > maxBytes) throw new ZipFormatError(`The expanded file exceeds the ${formatBytes(maxBytes)} preview limit.`);
        chunks.push(value);
      }
    } catch (error) {
      try { await reader.cancel(); } catch { /* ignored */ }
      if (error instanceof ZipFormatError) throw error;
      throw new ZipFormatError("The DEFLATE stream is damaged or unsupported.");
    }
    const output = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      output.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return output;
  }

  function inspectPath(name) {
    const normalized = name.replace(/\\/g, "/");
    const unsafe = /^(?:\/|[A-Za-z]:\/)/.test(normalized) || normalized.split("/").includes("..");
    return { safe: !unsafe, label: unsafe ? "Unsafe extraction path" : "Safe relative path" };
  }

  function decodeBytes(bytes, utf8) {
    if (utf8) return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    let result = "";
    for (const byte of bytes) result += byte < 0x80 ? String.fromCharCode(byte) : CP437_HIGH[byte - 0x80] || "�";
    return result;
  }

  function compressionMethodName(method) {
    const methods = {
      0: "Stored",
      1: "Shrunk",
      6: "Imploded",
      8: "Deflate",
      9: "Deflate64",
      12: "BZIP2",
      14: "LZMA",
      93: "Zstandard",
      95: "XZ",
      99: "AES encrypted"
    };
    return methods[method] || `Method ${method}`;
  }

  function dosDateTime(date, time) {
    if (!date) return null;
    const year = 1980 + ((date >> 9) & 0x7f);
    const month = ((date >> 5) & 0x0f) - 1;
    const day = date & 0x1f;
    const hour = (time >> 11) & 0x1f;
    const minute = (time >> 5) & 0x3f;
    const second = (time & 0x1f) * 2;
    const value = new Date(year, month, day, hour, minute, second);
    return Number.isNaN(value.getTime()) ? null : value;
  }

  function bigintToNumber(value, label) {
    if (value > MAX_SAFE_BIGINT) throw new ZipFormatError(`${label} is too large for this browser.`);
    return Number(value);
  }

  function ensureRange(view, offset, length, label) {
    if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length) || offset < 0 || length < 0 || offset + length > view.byteLength) {
      throw new ZipFormatError(`The ${label} extends beyond the end of the archive.`);
    }
  }

  let crcTable;
  function crc32Of(bytes) {
    if (!crcTable) {
      crcTable = new Uint32Array(256);
      for (let n = 0; n < 256; n += 1) {
        let value = n;
        for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
        crcTable[n] = value >>> 0;
      }
    }
    let crc = 0xffffffff;
    for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function formatBytes(value) {
    if (!Number.isFinite(value) || value < 0) return "—";
    if (value < 1024) return `${value} B`;
    const units = ["KB", "MB", "GB", "TB"];
    let amount = value;
    let unit = -1;
    do {
      amount /= 1024;
      unit += 1;
    } while (amount >= 1024 && unit < units.length - 1);
    return `${amount >= 10 ? amount.toFixed(1) : amount.toFixed(2)} ${units[unit]}`;
  }

  const api = { ZipArchive, ZipFormatError, crc32Of, formatBytes, compressionMethodName, inspectPath };
  global.CanvasZipReader = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
