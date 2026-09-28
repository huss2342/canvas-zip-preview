// Ground Control 0.1.0; generated from packages/runner.
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  if (mod && typeof mod === "object" || typeof mod === "function") {
    for (let key of __getOwnPropNames(mod))
      if (!__hasOwnProp.call(to, key))
        __defProp(to, key, {
          get: __accessProp.bind(mod, key),
          enumerable: true
        });
  }
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/.bun/semver@7.7.2/node_modules/semver/internal/constants.js
var require_constants = __commonJS(function(exports, module) {
  var SEMVER_SPEC_VERSION = "2.0.0";
  var MAX_LENGTH = 256;
  var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
  var MAX_SAFE_COMPONENT_LENGTH = 16;
  var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
  var RELEASE_TYPES = [
    "major",
    "premajor",
    "minor",
    "preminor",
    "patch",
    "prepatch",
    "prerelease"
  ];
  module.exports = {
    MAX_LENGTH,
    MAX_SAFE_COMPONENT_LENGTH,
    MAX_SAFE_BUILD_LENGTH,
    MAX_SAFE_INTEGER,
    RELEASE_TYPES,
    SEMVER_SPEC_VERSION,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  };
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/internal/debug.js
var require_debug = __commonJS(function(exports, module) {
  var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {};
  module.exports = debug;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/internal/re.js
var require_re = __commonJS(function(exports, module) {
  var {
    MAX_SAFE_COMPONENT_LENGTH,
    MAX_SAFE_BUILD_LENGTH,
    MAX_LENGTH
  } = require_constants();
  var debug = require_debug();
  exports = module.exports = {};
  var re = exports.re = [];
  var safeRe = exports.safeRe = [];
  var src = exports.src = [];
  var safeSrc = exports.safeSrc = [];
  var t = exports.t = {};
  var R = 0;
  var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
  var safeRegexReplacements = [
    ["\\s", 1],
    ["\\d", MAX_LENGTH],
    [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
  ];
  var makeSafeRegex = (value) => {
    for (const [token, max] of safeRegexReplacements) {
      value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
    }
    return value;
  };
  var createToken = (name, value, isGlobal) => {
    const safe = makeSafeRegex(value);
    const index = R++;
    debug(name, index, value);
    t[name] = index;
    src[index] = value;
    safeSrc[index] = safe;
    re[index] = new RegExp(value, isGlobal ? "g" : undefined);
    safeRe[index] = new RegExp(safe, isGlobal ? "g" : undefined);
  };
  createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
  createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
  createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
  createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.` + `(${src[t.NUMERICIDENTIFIER]})\\.` + `(${src[t.NUMERICIDENTIFIER]})`);
  createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` + `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` + `(${src[t.NUMERICIDENTIFIERLOOSE]})`);
  createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIER]})`);
  createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIERLOOSE]})`);
  createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
  createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
  createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
  createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
  createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
  createToken("FULL", `^${src[t.FULLPLAIN]}$`);
  createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
  createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
  createToken("GTLT", "((?:<|>)?=?)");
  createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
  createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
  createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` + `(?:\\.(${src[t.XRANGEIDENTIFIER]})` + `(?:\\.(${src[t.XRANGEIDENTIFIER]})` + `(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?` + `)?)?`);
  createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?` + `)?)?`);
  createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
  createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
  createToken("COERCEPLAIN", `${"(^|[^\\d])" + "(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})` + `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` + `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
  createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
  createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?` + `(?:${src[t.BUILD]})?` + `(?:$|[^\\d])`);
  createToken("COERCERTL", src[t.COERCE], true);
  createToken("COERCERTLFULL", src[t.COERCEFULL], true);
  createToken("LONETILDE", "(?:~>?)");
  createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
  exports.tildeTrimReplace = "$1~";
  createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
  createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
  createToken("LONECARET", "(?:\\^)");
  createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
  exports.caretTrimReplace = "$1^";
  createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
  createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
  createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
  createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
  createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
  exports.comparatorTrimReplace = "$1$2$3";
  createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})` + `\\s+-\\s+` + `(${src[t.XRANGEPLAIN]})` + `\\s*$`);
  createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})` + `\\s+-\\s+` + `(${src[t.XRANGEPLAINLOOSE]})` + `\\s*$`);
  createToken("STAR", "(<|>)?=?\\s*\\*");
  createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
  createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS(function(exports, module) {
  var looseOption = Object.freeze({ loose: true });
  var emptyOpts = Object.freeze({});
  var parseOptions = (options) => {
    if (!options) {
      return emptyOpts;
    }
    if (typeof options !== "object") {
      return looseOption;
    }
    return options;
  };
  module.exports = parseOptions;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS(function(exports, module) {
  var numeric = /^[0-9]+$/;
  var compareIdentifiers = (a, b) => {
    const anum = numeric.test(a);
    const bnum = numeric.test(b);
    if (anum && bnum) {
      a = +a;
      b = +b;
    }
    return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
  };
  var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
  module.exports = {
    compareIdentifiers,
    rcompareIdentifiers
  };
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/classes/semver.js
var require_semver = __commonJS(function(exports, module) {
  var debug = require_debug();
  var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
  var { safeRe: re, t } = require_re();
  var parseOptions = require_parse_options();
  var { compareIdentifiers } = require_identifiers();

  class SemVer {
    constructor(version, options) {
      options = parseOptions(options);
      if (version instanceof SemVer) {
        if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
          return version;
        } else {
          version = version.version;
        }
      } else if (typeof version !== "string") {
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
      }
      if (version.length > MAX_LENGTH) {
        throw new TypeError(`version is longer than ${MAX_LENGTH} characters`);
      }
      debug("SemVer", version, options);
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
      if (!m) {
        throw new TypeError(`Invalid Version: ${version}`);
      }
      this.raw = version;
      this.major = +m[1];
      this.minor = +m[2];
      this.patch = +m[3];
      if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
        throw new TypeError("Invalid major version");
      }
      if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
        throw new TypeError("Invalid minor version");
      }
      if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
        throw new TypeError("Invalid patch version");
      }
      if (!m[4]) {
        this.prerelease = [];
      } else {
        this.prerelease = m[4].split(".").map((id) => {
          if (/^[0-9]+$/.test(id)) {
            const num = +id;
            if (num >= 0 && num < MAX_SAFE_INTEGER) {
              return num;
            }
          }
          return id;
        });
      }
      this.build = m[5] ? m[5].split(".") : [];
      this.format();
    }
    format() {
      this.version = `${this.major}.${this.minor}.${this.patch}`;
      if (this.prerelease.length) {
        this.version += `-${this.prerelease.join(".")}`;
      }
      return this.version;
    }
    toString() {
      return this.version;
    }
    compare(other) {
      debug("SemVer.compare", this.version, this.options, other);
      if (!(other instanceof SemVer)) {
        if (typeof other === "string" && other === this.version) {
          return 0;
        }
        other = new SemVer(other, this.options);
      }
      if (other.version === this.version) {
        return 0;
      }
      return this.compareMain(other) || this.comparePre(other);
    }
    compareMain(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
    }
    comparePre(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      if (this.prerelease.length && !other.prerelease.length) {
        return -1;
      } else if (!this.prerelease.length && other.prerelease.length) {
        return 1;
      } else if (!this.prerelease.length && !other.prerelease.length) {
        return 0;
      }
      let i = 0;
      do {
        const a = this.prerelease[i];
        const b = other.prerelease[i];
        debug("prerelease compare", i, a, b);
        if (a === undefined && b === undefined) {
          return 0;
        } else if (b === undefined) {
          return 1;
        } else if (a === undefined) {
          return -1;
        } else if (a === b) {
          continue;
        } else {
          return compareIdentifiers(a, b);
        }
      } while (++i);
    }
    compareBuild(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      let i = 0;
      do {
        const a = this.build[i];
        const b = other.build[i];
        debug("build compare", i, a, b);
        if (a === undefined && b === undefined) {
          return 0;
        } else if (b === undefined) {
          return 1;
        } else if (a === undefined) {
          return -1;
        } else if (a === b) {
          continue;
        } else {
          return compareIdentifiers(a, b);
        }
      } while (++i);
    }
    inc(release, identifier, identifierBase) {
      if (release.startsWith("pre")) {
        if (!identifier && identifierBase === false) {
          throw new Error("invalid increment argument: identifier is empty");
        }
        if (identifier) {
          const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
          if (!match || match[1] !== identifier) {
            throw new Error(`invalid identifier: ${identifier}`);
          }
        }
      }
      switch (release) {
        case "premajor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor = 0;
          this.major++;
          this.inc("pre", identifier, identifierBase);
          break;
        case "preminor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor++;
          this.inc("pre", identifier, identifierBase);
          break;
        case "prepatch":
          this.prerelease.length = 0;
          this.inc("patch", identifier, identifierBase);
          this.inc("pre", identifier, identifierBase);
          break;
        case "prerelease":
          if (this.prerelease.length === 0) {
            this.inc("patch", identifier, identifierBase);
          }
          this.inc("pre", identifier, identifierBase);
          break;
        case "release":
          if (this.prerelease.length === 0) {
            throw new Error(`version ${this.raw} is not a prerelease`);
          }
          this.prerelease.length = 0;
          break;
        case "major":
          if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
            this.major++;
          }
          this.minor = 0;
          this.patch = 0;
          this.prerelease = [];
          break;
        case "minor":
          if (this.patch !== 0 || this.prerelease.length === 0) {
            this.minor++;
          }
          this.patch = 0;
          this.prerelease = [];
          break;
        case "patch":
          if (this.prerelease.length === 0) {
            this.patch++;
          }
          this.prerelease = [];
          break;
        case "pre": {
          const base = Number(identifierBase) ? 1 : 0;
          if (this.prerelease.length === 0) {
            this.prerelease = [base];
          } else {
            let i = this.prerelease.length;
            while (--i >= 0) {
              if (typeof this.prerelease[i] === "number") {
                this.prerelease[i]++;
                i = -2;
              }
            }
            if (i === -1) {
              if (identifier === this.prerelease.join(".") && identifierBase === false) {
                throw new Error("invalid increment argument: identifier already exists");
              }
              this.prerelease.push(base);
            }
          }
          if (identifier) {
            let prerelease = [identifier, base];
            if (identifierBase === false) {
              prerelease = [identifier];
            }
            if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
              if (isNaN(this.prerelease[1])) {
                this.prerelease = prerelease;
              }
            } else {
              this.prerelease = prerelease;
            }
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${release}`);
      }
      this.raw = this.format();
      if (this.build.length) {
        this.raw += `+${this.build.join(".")}`;
      }
      return this;
    }
  }
  module.exports = SemVer;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/parse.js
var require_parse = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var parse = (version, options, throwErrors = false) => {
    if (version instanceof SemVer) {
      return version;
    }
    try {
      return new SemVer(version, options);
    } catch (er) {
      if (!throwErrors) {
        return null;
      }
      throw er;
    }
  };
  module.exports = parse;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/valid.js
var require_valid = __commonJS(function(exports, module) {
  var parse = require_parse();
  var valid = (version, options) => {
    const v = parse(version, options);
    return v ? v.version : null;
  };
  module.exports = valid;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/clean.js
var require_clean = __commonJS(function(exports, module) {
  var parse = require_parse();
  var clean = (version, options) => {
    const s = parse(version.trim().replace(/^[=v]+/, ""), options);
    return s ? s.version : null;
  };
  module.exports = clean;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/inc.js
var require_inc = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var inc = (version, release, options, identifier, identifierBase) => {
    if (typeof options === "string") {
      identifierBase = identifier;
      identifier = options;
      options = undefined;
    }
    try {
      return new SemVer(version instanceof SemVer ? version.version : version, options).inc(release, identifier, identifierBase).version;
    } catch (er) {
      return null;
    }
  };
  module.exports = inc;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/diff.js
var require_diff = __commonJS(function(exports, module) {
  var parse = require_parse();
  var diff = (version1, version2) => {
    const v1 = parse(version1, null, true);
    const v2 = parse(version2, null, true);
    const comparison = v1.compare(v2);
    if (comparison === 0) {
      return null;
    }
    const v1Higher = comparison > 0;
    const highVersion = v1Higher ? v1 : v2;
    const lowVersion = v1Higher ? v2 : v1;
    const highHasPre = !!highVersion.prerelease.length;
    const lowHasPre = !!lowVersion.prerelease.length;
    if (lowHasPre && !highHasPre) {
      if (!lowVersion.patch && !lowVersion.minor) {
        return "major";
      }
      if (lowVersion.compareMain(highVersion) === 0) {
        if (lowVersion.minor && !lowVersion.patch) {
          return "minor";
        }
        return "patch";
      }
    }
    const prefix = highHasPre ? "pre" : "";
    if (v1.major !== v2.major) {
      return prefix + "major";
    }
    if (v1.minor !== v2.minor) {
      return prefix + "minor";
    }
    if (v1.patch !== v2.patch) {
      return prefix + "patch";
    }
    return "prerelease";
  };
  module.exports = diff;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/major.js
var require_major = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var major = (a, loose) => new SemVer(a, loose).major;
  module.exports = major;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/minor.js
var require_minor = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var minor = (a, loose) => new SemVer(a, loose).minor;
  module.exports = minor;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/patch.js
var require_patch = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var patch = (a, loose) => new SemVer(a, loose).patch;
  module.exports = patch;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/prerelease.js
var require_prerelease = __commonJS(function(exports, module) {
  var parse = require_parse();
  var prerelease = (version, options) => {
    const parsed = parse(version, options);
    return parsed && parsed.prerelease.length ? parsed.prerelease : null;
  };
  module.exports = prerelease;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/compare.js
var require_compare = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
  module.exports = compare;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/rcompare.js
var require_rcompare = __commonJS(function(exports, module) {
  var compare = require_compare();
  var rcompare = (a, b, loose) => compare(b, a, loose);
  module.exports = rcompare;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/compare-loose.js
var require_compare_loose = __commonJS(function(exports, module) {
  var compare = require_compare();
  var compareLoose = (a, b) => compare(a, b, true);
  module.exports = compareLoose;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/compare-build.js
var require_compare_build = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var compareBuild = (a, b, loose) => {
    const versionA = new SemVer(a, loose);
    const versionB = new SemVer(b, loose);
    return versionA.compare(versionB) || versionA.compareBuild(versionB);
  };
  module.exports = compareBuild;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/sort.js
var require_sort = __commonJS(function(exports, module) {
  var compareBuild = require_compare_build();
  var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
  module.exports = sort;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/rsort.js
var require_rsort = __commonJS(function(exports, module) {
  var compareBuild = require_compare_build();
  var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
  module.exports = rsort;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/gt.js
var require_gt = __commonJS(function(exports, module) {
  var compare = require_compare();
  var gt = (a, b, loose) => compare(a, b, loose) > 0;
  module.exports = gt;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/lt.js
var require_lt = __commonJS(function(exports, module) {
  var compare = require_compare();
  var lt = (a, b, loose) => compare(a, b, loose) < 0;
  module.exports = lt;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/eq.js
var require_eq = __commonJS(function(exports, module) {
  var compare = require_compare();
  var eq = (a, b, loose) => compare(a, b, loose) === 0;
  module.exports = eq;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/neq.js
var require_neq = __commonJS(function(exports, module) {
  var compare = require_compare();
  var neq = (a, b, loose) => compare(a, b, loose) !== 0;
  module.exports = neq;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/gte.js
var require_gte = __commonJS(function(exports, module) {
  var compare = require_compare();
  var gte = (a, b, loose) => compare(a, b, loose) >= 0;
  module.exports = gte;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/lte.js
var require_lte = __commonJS(function(exports, module) {
  var compare = require_compare();
  var lte = (a, b, loose) => compare(a, b, loose) <= 0;
  module.exports = lte;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/cmp.js
var require_cmp = __commonJS(function(exports, module) {
  var eq = require_eq();
  var neq = require_neq();
  var gt = require_gt();
  var gte = require_gte();
  var lt = require_lt();
  var lte = require_lte();
  var cmp = (a, op, b, loose) => {
    switch (op) {
      case "===":
        if (typeof a === "object") {
          a = a.version;
        }
        if (typeof b === "object") {
          b = b.version;
        }
        return a === b;
      case "!==":
        if (typeof a === "object") {
          a = a.version;
        }
        if (typeof b === "object") {
          b = b.version;
        }
        return a !== b;
      case "":
      case "=":
      case "==":
        return eq(a, b, loose);
      case "!=":
        return neq(a, b, loose);
      case ">":
        return gt(a, b, loose);
      case ">=":
        return gte(a, b, loose);
      case "<":
        return lt(a, b, loose);
      case "<=":
        return lte(a, b, loose);
      default:
        throw new TypeError(`Invalid operator: ${op}`);
    }
  };
  module.exports = cmp;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/coerce.js
var require_coerce = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var parse = require_parse();
  var { safeRe: re, t } = require_re();
  var coerce = (version, options) => {
    if (version instanceof SemVer) {
      return version;
    }
    if (typeof version === "number") {
      version = String(version);
    }
    if (typeof version !== "string") {
      return null;
    }
    options = options || {};
    let match = null;
    if (!options.rtl) {
      match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
    } else {
      const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
      let next;
      while ((next = coerceRtlRegex.exec(version)) && (!match || match.index + match[0].length !== version.length)) {
        if (!match || next.index + next[0].length !== match.index + match[0].length) {
          match = next;
        }
        coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
      }
      coerceRtlRegex.lastIndex = -1;
    }
    if (match === null) {
      return null;
    }
    const major = match[2];
    const minor = match[3] || "0";
    const patch = match[4] || "0";
    const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : "";
    const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
    return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options);
  };
  module.exports = coerce;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/internal/lrucache.js
var require_lrucache = __commonJS(function(exports, module) {
  class LRUCache {
    constructor() {
      this.max = 1000;
      this.map = new Map;
    }
    get(key) {
      const value = this.map.get(key);
      if (value === undefined) {
        return;
      } else {
        this.map.delete(key);
        this.map.set(key, value);
        return value;
      }
    }
    delete(key) {
      return this.map.delete(key);
    }
    set(key, value) {
      const deleted = this.delete(key);
      if (!deleted && value !== undefined) {
        if (this.map.size >= this.max) {
          const firstKey = this.map.keys().next().value;
          this.delete(firstKey);
        }
        this.map.set(key, value);
      }
      return this;
    }
  }
  module.exports = LRUCache;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/classes/range.js
var require_range = __commonJS(function(exports, module) {
  var SPACE_CHARACTERS = /\s+/g;

  class Range {
    constructor(range, options) {
      options = parseOptions(options);
      if (range instanceof Range) {
        if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
          return range;
        } else {
          return new Range(range.raw, options);
        }
      }
      if (range instanceof Comparator) {
        this.raw = range.value;
        this.set = [[range]];
        this.formatted = undefined;
        return this;
      }
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      this.raw = range.trim().replace(SPACE_CHARACTERS, " ");
      this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
      if (!this.set.length) {
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      }
      if (this.set.length > 1) {
        const first = this.set[0];
        this.set = this.set.filter((c) => !isNullSet(c[0]));
        if (this.set.length === 0) {
          this.set = [first];
        } else if (this.set.length > 1) {
          for (const c of this.set) {
            if (c.length === 1 && isAny(c[0])) {
              this.set = [c];
              break;
            }
          }
        }
      }
      this.formatted = undefined;
    }
    get range() {
      if (this.formatted === undefined) {
        this.formatted = "";
        for (let i = 0;i < this.set.length; i++) {
          if (i > 0) {
            this.formatted += "||";
          }
          const comps = this.set[i];
          for (let k = 0;k < comps.length; k++) {
            if (k > 0) {
              this.formatted += " ";
            }
            this.formatted += comps[k].toString().trim();
          }
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(range) {
      const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
      const memoKey = memoOpts + ":" + range;
      const cached = cache.get(memoKey);
      if (cached) {
        return cached;
      }
      const loose = this.options.loose;
      const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
      range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
      debug("hyphen replace", range);
      range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
      debug("comparator trim", range);
      range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
      debug("tilde trim", range);
      range = range.replace(re[t.CARETTRIM], caretTrimReplace);
      debug("caret trim", range);
      let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
      if (loose) {
        rangeList = rangeList.filter((comp) => {
          debug("loose invalid filter", comp, this.options);
          return !!comp.match(re[t.COMPARATORLOOSE]);
        });
      }
      debug("range list", rangeList);
      const rangeMap = new Map;
      const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
      for (const comp of comparators) {
        if (isNullSet(comp)) {
          return [comp];
        }
        rangeMap.set(comp.value, comp);
      }
      if (rangeMap.size > 1 && rangeMap.has("")) {
        rangeMap.delete("");
      }
      const result = [...rangeMap.values()];
      cache.set(memoKey, result);
      return result;
    }
    intersects(range, options) {
      if (!(range instanceof Range)) {
        throw new TypeError("a Range is required");
      }
      return this.set.some((thisComparators) => {
        return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
          return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
            return rangeComparators.every((rangeComparator) => {
              return thisComparator.intersects(rangeComparator, options);
            });
          });
        });
      });
    }
    test(version) {
      if (!version) {
        return false;
      }
      if (typeof version === "string") {
        try {
          version = new SemVer(version, this.options);
        } catch (er) {
          return false;
        }
      }
      for (let i = 0;i < this.set.length; i++) {
        if (testSet(this.set[i], version, this.options)) {
          return true;
        }
      }
      return false;
    }
  }
  module.exports = Range;
  var LRU = require_lrucache();
  var cache = new LRU;
  var parseOptions = require_parse_options();
  var Comparator = require_comparator();
  var debug = require_debug();
  var SemVer = require_semver();
  var {
    safeRe: re,
    t,
    comparatorTrimReplace,
    tildeTrimReplace,
    caretTrimReplace
  } = require_re();
  var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
  var isNullSet = (c) => c.value === "<0.0.0-0";
  var isAny = (c) => c.value === "";
  var isSatisfiable = (comparators, options) => {
    let result = true;
    const remainingComparators = comparators.slice();
    let testComparator = remainingComparators.pop();
    while (result && remainingComparators.length) {
      result = remainingComparators.every((otherComparator) => {
        return testComparator.intersects(otherComparator, options);
      });
      testComparator = remainingComparators.pop();
    }
    return result;
  };
  var parseComparator = (comp, options) => {
    debug("comp", comp, options);
    comp = replaceCarets(comp, options);
    debug("caret", comp);
    comp = replaceTildes(comp, options);
    debug("tildes", comp);
    comp = replaceXRanges(comp, options);
    debug("xrange", comp);
    comp = replaceStars(comp, options);
    debug("stars", comp);
    return comp;
  };
  var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
  var replaceTildes = (comp, options) => {
    return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
  };
  var replaceTilde = (comp, options) => {
    const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
    return comp.replace(r, (_, M, m, p, pr) => {
      debug("tilde", comp, _, M, m, p, pr);
      let ret;
      if (isX(M)) {
        ret = "";
      } else if (isX(m)) {
        ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
      } else if (isX(p)) {
        ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
      } else if (pr) {
        debug("replaceTilde pr", pr);
        ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
      } else {
        ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
      }
      debug("tilde return", ret);
      return ret;
    });
  };
  var replaceCarets = (comp, options) => {
    return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
  };
  var replaceCaret = (comp, options) => {
    debug("caret", comp, options);
    const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
    const z = options.includePrerelease ? "-0" : "";
    return comp.replace(r, (_, M, m, p, pr) => {
      debug("caret", comp, _, M, m, p, pr);
      let ret;
      if (isX(M)) {
        ret = "";
      } else if (isX(m)) {
        ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
      } else if (isX(p)) {
        if (M === "0") {
          ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
        }
      } else if (pr) {
        debug("replaceCaret pr", pr);
        if (M === "0") {
          if (m === "0") {
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
          }
        } else {
          ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
        }
      } else {
        debug("no pr");
        if (M === "0") {
          if (m === "0") {
            ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
          } else {
            ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
          }
        } else {
          ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
        }
      }
      debug("caret return", ret);
      return ret;
    });
  };
  var replaceXRanges = (comp, options) => {
    debug("replaceXRanges", comp, options);
    return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
  };
  var replaceXRange = (comp, options) => {
    comp = comp.trim();
    const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
    return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
      debug("xRange", comp, ret, gtlt, M, m, p, pr);
      const xM = isX(M);
      const xm = xM || isX(m);
      const xp = xm || isX(p);
      const anyX = xp;
      if (gtlt === "=" && anyX) {
        gtlt = "";
      }
      pr = options.includePrerelease ? "-0" : "";
      if (xM) {
        if (gtlt === ">" || gtlt === "<") {
          ret = "<0.0.0-0";
        } else {
          ret = "*";
        }
      } else if (gtlt && anyX) {
        if (xm) {
          m = 0;
        }
        p = 0;
        if (gtlt === ">") {
          gtlt = ">=";
          if (xm) {
            M = +M + 1;
            m = 0;
            p = 0;
          } else {
            m = +m + 1;
            p = 0;
          }
        } else if (gtlt === "<=") {
          gtlt = "<";
          if (xm) {
            M = +M + 1;
          } else {
            m = +m + 1;
          }
        }
        if (gtlt === "<") {
          pr = "-0";
        }
        ret = `${gtlt + M}.${m}.${p}${pr}`;
      } else if (xm) {
        ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
      } else if (xp) {
        ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
      }
      debug("xRange return", ret);
      return ret;
    });
  };
  var replaceStars = (comp, options) => {
    debug("replaceStars", comp, options);
    return comp.trim().replace(re[t.STAR], "");
  };
  var replaceGTE0 = (comp, options) => {
    debug("replaceGTE0", comp, options);
    return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
  };
  var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
    if (isX(fM)) {
      from = "";
    } else if (isX(fm)) {
      from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
    } else if (isX(fp)) {
      from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
    } else if (fpr) {
      from = `>=${from}`;
    } else {
      from = `>=${from}${incPr ? "-0" : ""}`;
    }
    if (isX(tM)) {
      to = "";
    } else if (isX(tm)) {
      to = `<${+tM + 1}.0.0-0`;
    } else if (isX(tp)) {
      to = `<${tM}.${+tm + 1}.0-0`;
    } else if (tpr) {
      to = `<=${tM}.${tm}.${tp}-${tpr}`;
    } else if (incPr) {
      to = `<${tM}.${tm}.${+tp + 1}-0`;
    } else {
      to = `<=${to}`;
    }
    return `${from} ${to}`.trim();
  };
  var testSet = (set, version, options) => {
    for (let i = 0;i < set.length; i++) {
      if (!set[i].test(version)) {
        return false;
      }
    }
    if (version.prerelease.length && !options.includePrerelease) {
      for (let i = 0;i < set.length; i++) {
        debug(set[i].semver);
        if (set[i].semver === Comparator.ANY) {
          continue;
        }
        if (set[i].semver.prerelease.length > 0) {
          const allowed = set[i].semver;
          if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
            return true;
          }
        }
      }
      return false;
    }
    return true;
  };
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/classes/comparator.js
var require_comparator = __commonJS(function(exports, module) {
  var ANY = Symbol("SemVer ANY");

  class Comparator {
    static get ANY() {
      return ANY;
    }
    constructor(comp, options) {
      options = parseOptions(options);
      if (comp instanceof Comparator) {
        if (comp.loose === !!options.loose) {
          return comp;
        } else {
          comp = comp.value;
        }
      }
      comp = comp.trim().split(/\s+/).join(" ");
      debug("comparator", comp, options);
      this.options = options;
      this.loose = !!options.loose;
      this.parse(comp);
      if (this.semver === ANY) {
        this.value = "";
      } else {
        this.value = this.operator + this.semver.version;
      }
      debug("comp", this);
    }
    parse(comp) {
      const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
      const m = comp.match(r);
      if (!m) {
        throw new TypeError(`Invalid comparator: ${comp}`);
      }
      this.operator = m[1] !== undefined ? m[1] : "";
      if (this.operator === "=") {
        this.operator = "";
      }
      if (!m[2]) {
        this.semver = ANY;
      } else {
        this.semver = new SemVer(m[2], this.options.loose);
      }
    }
    toString() {
      return this.value;
    }
    test(version) {
      debug("Comparator.test", version, this.options.loose);
      if (this.semver === ANY || version === ANY) {
        return true;
      }
      if (typeof version === "string") {
        try {
          version = new SemVer(version, this.options);
        } catch (er) {
          return false;
        }
      }
      return cmp(version, this.operator, this.semver, this.options);
    }
    intersects(comp, options) {
      if (!(comp instanceof Comparator)) {
        throw new TypeError("a Comparator is required");
      }
      if (this.operator === "") {
        if (this.value === "") {
          return true;
        }
        return new Range(comp.value, options).test(this.value);
      } else if (comp.operator === "") {
        if (comp.value === "") {
          return true;
        }
        return new Range(this.value, options).test(comp.semver);
      }
      options = parseOptions(options);
      if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
        return false;
      }
      if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
        return false;
      }
      if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
        return true;
      }
      if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
        return true;
      }
      if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
        return true;
      }
      if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
        return true;
      }
      if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
        return true;
      }
      return false;
    }
  }
  module.exports = Comparator;
  var parseOptions = require_parse_options();
  var { safeRe: re, t } = require_re();
  var cmp = require_cmp();
  var debug = require_debug();
  var SemVer = require_semver();
  var Range = require_range();
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/functions/satisfies.js
var require_satisfies = __commonJS(function(exports, module) {
  var Range = require_range();
  var satisfies = (version, range, options) => {
    try {
      range = new Range(range, options);
    } catch (er) {
      return false;
    }
    return range.test(version);
  };
  module.exports = satisfies;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/ranges/to-comparators.js
var require_to_comparators = __commonJS(function(exports, module) {
  var Range = require_range();
  var toComparators = (range, options) => new Range(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
  module.exports = toComparators;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var Range = require_range();
  var maxSatisfying = (versions, range, options) => {
    let max = null;
    let maxSV = null;
    let rangeObj = null;
    try {
      rangeObj = new Range(range, options);
    } catch (er) {
      return null;
    }
    versions.forEach((v) => {
      if (rangeObj.test(v)) {
        if (!max || maxSV.compare(v) === -1) {
          max = v;
          maxSV = new SemVer(max, options);
        }
      }
    });
    return max;
  };
  module.exports = maxSatisfying;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var Range = require_range();
  var minSatisfying = (versions, range, options) => {
    let min = null;
    let minSV = null;
    let rangeObj = null;
    try {
      rangeObj = new Range(range, options);
    } catch (er) {
      return null;
    }
    versions.forEach((v) => {
      if (rangeObj.test(v)) {
        if (!min || minSV.compare(v) === 1) {
          min = v;
          minSV = new SemVer(min, options);
        }
      }
    });
    return min;
  };
  module.exports = minSatisfying;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/ranges/min-version.js
var require_min_version = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var Range = require_range();
  var gt = require_gt();
  var minVersion = (range, loose) => {
    range = new Range(range, loose);
    let minver = new SemVer("0.0.0");
    if (range.test(minver)) {
      return minver;
    }
    minver = new SemVer("0.0.0-0");
    if (range.test(minver)) {
      return minver;
    }
    minver = null;
    for (let i = 0;i < range.set.length; ++i) {
      const comparators = range.set[i];
      let setMin = null;
      comparators.forEach((comparator) => {
        const compver = new SemVer(comparator.semver.version);
        switch (comparator.operator) {
          case ">":
            if (compver.prerelease.length === 0) {
              compver.patch++;
            } else {
              compver.prerelease.push(0);
            }
            compver.raw = compver.format();
          case "":
          case ">=":
            if (!setMin || gt(compver, setMin)) {
              setMin = compver;
            }
            break;
          case "<":
          case "<=":
            break;
          default:
            throw new Error(`Unexpected operation: ${comparator.operator}`);
        }
      });
      if (setMin && (!minver || gt(minver, setMin))) {
        minver = setMin;
      }
    }
    if (minver && range.test(minver)) {
      return minver;
    }
    return null;
  };
  module.exports = minVersion;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/ranges/valid.js
var require_valid2 = __commonJS(function(exports, module) {
  var Range = require_range();
  var validRange = (range, options) => {
    try {
      return new Range(range, options).range || "*";
    } catch (er) {
      return null;
    }
  };
  module.exports = validRange;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/ranges/outside.js
var require_outside = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var Comparator = require_comparator();
  var { ANY } = Comparator;
  var Range = require_range();
  var satisfies = require_satisfies();
  var gt = require_gt();
  var lt = require_lt();
  var lte = require_lte();
  var gte = require_gte();
  var outside = (version, range, hilo, options) => {
    version = new SemVer(version, options);
    range = new Range(range, options);
    let gtfn, ltefn, ltfn, comp, ecomp;
    switch (hilo) {
      case ">":
        gtfn = gt;
        ltefn = lte;
        ltfn = lt;
        comp = ">";
        ecomp = ">=";
        break;
      case "<":
        gtfn = lt;
        ltefn = gte;
        ltfn = gt;
        comp = "<";
        ecomp = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (satisfies(version, range, options)) {
      return false;
    }
    for (let i = 0;i < range.set.length; ++i) {
      const comparators = range.set[i];
      let high = null;
      let low = null;
      comparators.forEach((comparator) => {
        if (comparator.semver === ANY) {
          comparator = new Comparator(">=0.0.0");
        }
        high = high || comparator;
        low = low || comparator;
        if (gtfn(comparator.semver, high.semver, options)) {
          high = comparator;
        } else if (ltfn(comparator.semver, low.semver, options)) {
          low = comparator;
        }
      });
      if (high.operator === comp || high.operator === ecomp) {
        return false;
      }
      if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
        return false;
      } else if (low.operator === ecomp && ltfn(version, low.semver)) {
        return false;
      }
    }
    return true;
  };
  module.exports = outside;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/ranges/gtr.js
var require_gtr = __commonJS(function(exports, module) {
  var outside = require_outside();
  var gtr = (version, range, options) => outside(version, range, ">", options);
  module.exports = gtr;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/ranges/ltr.js
var require_ltr = __commonJS(function(exports, module) {
  var outside = require_outside();
  var ltr = (version, range, options) => outside(version, range, "<", options);
  module.exports = ltr;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/ranges/intersects.js
var require_intersects = __commonJS(function(exports, module) {
  var Range = require_range();
  var intersects = (r1, r2, options) => {
    r1 = new Range(r1, options);
    r2 = new Range(r2, options);
    return r1.intersects(r2, options);
  };
  module.exports = intersects;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/ranges/simplify.js
var require_simplify = __commonJS(function(exports, module) {
  var satisfies = require_satisfies();
  var compare = require_compare();
  module.exports = (versions, range, options) => {
    const set = [];
    let first = null;
    let prev = null;
    const v = versions.sort((a, b) => compare(a, b, options));
    for (const version of v) {
      const included = satisfies(version, range, options);
      if (included) {
        prev = version;
        if (!first) {
          first = version;
        }
      } else {
        if (prev) {
          set.push([first, prev]);
        }
        prev = null;
        first = null;
      }
    }
    if (first) {
      set.push([first, null]);
    }
    const ranges = [];
    for (const [min, max] of set) {
      if (min === max) {
        ranges.push(min);
      } else if (!max && min === v[0]) {
        ranges.push("*");
      } else if (!max) {
        ranges.push(`>=${min}`);
      } else if (min === v[0]) {
        ranges.push(`<=${max}`);
      } else {
        ranges.push(`${min} - ${max}`);
      }
    }
    const simplified = ranges.join(" || ");
    const original = typeof range.raw === "string" ? range.raw : String(range);
    return simplified.length < original.length ? simplified : range;
  };
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/ranges/subset.js
var require_subset = __commonJS(function(exports, module) {
  var Range = require_range();
  var Comparator = require_comparator();
  var { ANY } = Comparator;
  var satisfies = require_satisfies();
  var compare = require_compare();
  var subset = (sub, dom, options = {}) => {
    if (sub === dom) {
      return true;
    }
    sub = new Range(sub, options);
    dom = new Range(dom, options);
    let sawNonNull = false;
    OUTER:
      for (const simpleSub of sub.set) {
        for (const simpleDom of dom.set) {
          const isSub = simpleSubset(simpleSub, simpleDom, options);
          sawNonNull = sawNonNull || isSub !== null;
          if (isSub) {
            continue OUTER;
          }
        }
        if (sawNonNull) {
          return false;
        }
      }
    return true;
  };
  var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
  var minimumVersion = [new Comparator(">=0.0.0")];
  var simpleSubset = (sub, dom, options) => {
    if (sub === dom) {
      return true;
    }
    if (sub.length === 1 && sub[0].semver === ANY) {
      if (dom.length === 1 && dom[0].semver === ANY) {
        return true;
      } else if (options.includePrerelease) {
        sub = minimumVersionWithPreRelease;
      } else {
        sub = minimumVersion;
      }
    }
    if (dom.length === 1 && dom[0].semver === ANY) {
      if (options.includePrerelease) {
        return true;
      } else {
        dom = minimumVersion;
      }
    }
    const eqSet = new Set;
    let gt, lt;
    for (const c of sub) {
      if (c.operator === ">" || c.operator === ">=") {
        gt = higherGT(gt, c, options);
      } else if (c.operator === "<" || c.operator === "<=") {
        lt = lowerLT(lt, c, options);
      } else {
        eqSet.add(c.semver);
      }
    }
    if (eqSet.size > 1) {
      return null;
    }
    let gtltComp;
    if (gt && lt) {
      gtltComp = compare(gt.semver, lt.semver, options);
      if (gtltComp > 0) {
        return null;
      } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
        return null;
      }
    }
    for (const eq of eqSet) {
      if (gt && !satisfies(eq, String(gt), options)) {
        return null;
      }
      if (lt && !satisfies(eq, String(lt), options)) {
        return null;
      }
      for (const c of dom) {
        if (!satisfies(eq, String(c), options)) {
          return false;
        }
      }
      return true;
    }
    let higher, lower;
    let hasDomLT, hasDomGT;
    let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
    let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
    if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
      needDomLTPre = false;
    }
    for (const c of dom) {
      hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
      hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
      if (gt) {
        if (needDomGTPre) {
          if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
            needDomGTPre = false;
          }
        }
        if (c.operator === ">" || c.operator === ">=") {
          higher = higherGT(gt, c, options);
          if (higher === c && higher !== gt) {
            return false;
          }
        } else if (gt.operator === ">=" && !satisfies(gt.semver, String(c), options)) {
          return false;
        }
      }
      if (lt) {
        if (needDomLTPre) {
          if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
            needDomLTPre = false;
          }
        }
        if (c.operator === "<" || c.operator === "<=") {
          lower = lowerLT(lt, c, options);
          if (lower === c && lower !== lt) {
            return false;
          }
        } else if (lt.operator === "<=" && !satisfies(lt.semver, String(c), options)) {
          return false;
        }
      }
      if (!c.operator && (lt || gt) && gtltComp !== 0) {
        return false;
      }
    }
    if (gt && hasDomLT && !lt && gtltComp !== 0) {
      return false;
    }
    if (lt && hasDomGT && !gt && gtltComp !== 0) {
      return false;
    }
    if (needDomGTPre || needDomLTPre) {
      return false;
    }
    return true;
  };
  var higherGT = (a, b, options) => {
    if (!a) {
      return b;
    }
    const comp = compare(a.semver, b.semver, options);
    return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
  };
  var lowerLT = (a, b, options) => {
    if (!a) {
      return b;
    }
    const comp = compare(a.semver, b.semver, options);
    return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
  };
  module.exports = subset;
});

// node_modules/.bun/semver@7.7.2/node_modules/semver/index.js
var require_semver2 = __commonJS(function(exports, module) {
  var internalRe = require_re();
  var constants = require_constants();
  var SemVer = require_semver();
  var identifiers = require_identifiers();
  var parse = require_parse();
  var valid = require_valid();
  var clean = require_clean();
  var inc = require_inc();
  var diff = require_diff();
  var major = require_major();
  var minor = require_minor();
  var patch = require_patch();
  var prerelease = require_prerelease();
  var compare = require_compare();
  var rcompare = require_rcompare();
  var compareLoose = require_compare_loose();
  var compareBuild = require_compare_build();
  var sort = require_sort();
  var rsort = require_rsort();
  var gt = require_gt();
  var lt = require_lt();
  var eq = require_eq();
  var neq = require_neq();
  var gte = require_gte();
  var lte = require_lte();
  var cmp = require_cmp();
  var coerce = require_coerce();
  var Comparator = require_comparator();
  var Range = require_range();
  var satisfies = require_satisfies();
  var toComparators = require_to_comparators();
  var maxSatisfying = require_max_satisfying();
  var minSatisfying = require_min_satisfying();
  var minVersion = require_min_version();
  var validRange = require_valid2();
  var outside = require_outside();
  var gtr = require_gtr();
  var ltr = require_ltr();
  var intersects = require_intersects();
  var simplifyRange = require_simplify();
  var subset = require_subset();
  module.exports = {
    parse,
    valid,
    clean,
    inc,
    diff,
    major,
    minor,
    patch,
    prerelease,
    compare,
    rcompare,
    compareLoose,
    compareBuild,
    sort,
    rsort,
    gt,
    lt,
    eq,
    neq,
    gte,
    lte,
    cmp,
    coerce,
    Comparator,
    Range,
    satisfies,
    toComparators,
    maxSatisfying,
    minSatisfying,
    minVersion,
    validRange,
    outside,
    gtr,
    ltr,
    intersects,
    simplifyRange,
    subset,
    SemVer,
    re: internalRe.re,
    src: internalRe.src,
    tokens: internalRe.t,
    SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: constants.RELEASE_TYPES,
    compareIdentifiers: identifiers.compareIdentifiers,
    rcompareIdentifiers: identifiers.rcompareIdentifiers
  };
});

// packages/runner/src/run-plan.ts
import { readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { performance as performance4 } from "node:perf_hooks";

// packages/runner/src/cli-flag.ts
import { performance as performance2 } from "node:perf_hooks";

// packages/runner/src/command.ts
import { performance } from "node:perf_hooks";

// packages/runner/src/process-control.ts
import { spawn } from "node:child_process";

// packages/runner/src/runtime-limits.ts
var commandTimeoutMs = 120000;
var startTimeoutMs = 30000;
var portPollIntervalMs = 500;
var cleanupPollIntervalMs = 100;
var cleanupTimeoutMs = 3000;
var stopGraceMs = 250;
var outputLimitBytes = 65536;

// packages/runner/src/process-control.ts
function runEnvironment(withoutPort) {
  const env = { ...process.env };
  if (withoutPort)
    delete env.PORT;
  return env;
}
async function terminateGroup(pid) {
  if (process.platform === "win32") {
    return new Promise((resolve) => {
      const killer = spawn("taskkill.exe", ["/PID", String(pid), "/T", "/F"], {
        stdio: "ignore",
        windowsHide: true
      });
      killer.once("exit", (code) => resolve(code === 0));
      killer.once("error", () => resolve(false));
    });
  }
  try {
    process.kill(-pid, "SIGTERM");
    return true;
  } catch {
    return false;
  }
}
function forceGroup(pid) {
  if (process.platform === "win32")
    return;
  try {
    process.kill(-pid, "SIGKILL");
  } catch {
    return;
  }
}
async function withProcess(handle, action) {
  try {
    return await action(handle);
  } finally {
    await handle.stop();
  }
}
async function startProjectProcess(command, args, cwd, withoutPort = false) {
  const executable = process.platform === "win32" && command === "npm" ? "npm.cmd" : command;
  let child;
  try {
    child = spawn(executable, [...args], {
      cwd,
      env: runEnvironment(withoutPort),
      detached: process.platform !== "win32",
      shell: process.platform === "win32" && command === "npm",
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true
    });
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "spawn_failed",
        command,
        message: error instanceof Error ? error.message : "Process could not start"
      }
    };
  }
  let exited = false;
  const exit = new Promise((resolve) => child.once("exit", (code, signal) => {
    exited = true;
    resolve({ code, signal });
  }));
  let output = "";
  for (const stream of [child.stdout, child.stderr]) {
    stream.on("data", (chunk) => {
      if (output.length < outputLimitBytes)
        output += chunk.toString("utf8").slice(0, outputLimitBytes - output.length);
    });
  }
  const started = await new Promise((resolve) => {
    child.once("spawn", () => resolve({ ok: true, value: undefined }));
    child.once("error", (error) => resolve({
      ok: false,
      error: { code: "spawn_failed", command, message: error.message }
    }));
  });
  if (!started.ok)
    return started;
  const handle = {
    pid: child.pid ?? 0,
    exit,
    output: () => output,
    stop: async () => {
      if (child.pid === undefined)
        return;
      const terminated = await terminateGroup(child.pid);
      if (!terminated && !exited)
        child.kill();
      await Promise.race([
        exit,
        new Promise((resolve) => setTimeout(resolve, stopGraceMs))
      ]);
      if (!exited)
        forceGroup(child.pid);
      await Promise.race([
        exit,
        new Promise((resolve) => setTimeout(resolve, stopGraceMs))
      ]);
      if (!exited)
        throw new Error(`Process ${child.pid} did not terminate`);
    }
  };
  return { ok: true, value: handle };
}

// packages/runner/src/command.ts
var allowed = new Set([
  "npm",
  "pnpm",
  "yarn",
  "bun",
  "node",
  "npx",
  "cp",
  "mkdir",
  "touch"
]);
function tokens(command) {
  if (/[;&|<>`$()\r\n]/u.test(command) || command !== command.trim())
    return null;
  const parts = command.match(/"[^"]*"|'[^']*'|\S+/gu)?.map((part) => {
    if (part.startsWith('"') && part.endsWith('"') || part.startsWith("'") && part.endsWith("'"))
      return part.slice(1, -1);
    return part;
  }) ?? [];
  return parts.length > 0 && allowed.has(parts[0] ?? "") ? parts : null;
}
function outputText(output) {
  return output.split(/\r?\n/u).slice(0, 20).join(`
`).trim();
}
async function waitForExit(handle, timeoutMs) {
  let timer;
  try {
    return await Promise.race([
      handle.exit,
      new Promise((resolve) => {
        timer = setTimeout(() => resolve("timeout"), timeoutMs);
      })
    ]);
  } finally {
    if (timer !== undefined)
      clearTimeout(timer);
  }
}
async function commandOnce(command, cwd, timeoutMs) {
  const start = performance.now();
  const args = tokens(command);
  if (!args)
    return {
      status: "unverified",
      expected: "Allowed command",
      actual: "Command was not safe to run",
      durationMs: 0
    };
  const [executable, ...rest] = args;
  if (!executable)
    return {
      status: "unverified",
      expected: "Allowed command",
      actual: "Command was empty",
      durationMs: 0
    };
  const started = await startProjectProcess(executable, rest, cwd);
  if (!started.ok)
    return {
      status: "fail",
      expected: "Exit code 0",
      actual: started.error.message,
      durationMs: performance.now() - start
    };
  return withProcess(started.value, async (handle) => {
    const exit = await waitForExit(handle, timeoutMs);
    const status = exit === "timeout" || exit.code !== 0 ? "fail" : "pass";
    const actual = exit === "timeout" ? `Timed out after ${timeoutMs} ms` : `Exit ${exit.code}: ${outputText(handle.output())}`;
    return {
      status,
      expected: "Exit code 0",
      actual,
      durationMs: performance.now() - start
    };
  });
}
async function runCommand(command, cwd, timeoutMs = commandTimeoutMs) {
  const first = await commandOnce(command, cwd, timeoutMs);
  if (first.status !== "fail")
    return first;
  const second = await commandOnce(command, cwd, timeoutMs);
  if (second.status === "pass")
    return {
      ...second,
      status: "flaky",
      actual: `Passed after a clean retry. First: ${first.actual}`
    };
  return { ...second, actual: `${first.actual}
Retry: ${second.actual}` };
}

// packages/runner/src/result.ts
function ok(value) {
  return { ok: true, value };
}
function fail(code, subject) {
  return {
    ok: false,
    error: subject === undefined ? { code } : { code, subject }
  };
}
function snapshotFail(error) {
  return { ok: false, error: { code: "snapshot_error", snapshot: error } };
}

// packages/runner/src/manifest.ts
function object(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function readManifest(snapshot) {
  const read = snapshot.readText("package.json");
  if (!read.ok)
    return snapshotFail(read.error);
  if (read.value === null)
    return ok(null);
  try {
    const parsed = JSON.parse(read.value);
    return object(parsed) ? ok(parsed) : fail("invalid_manifest", "package.json");
  } catch {
    return fail("invalid_manifest", "package.json");
  }
}
function scriptInManifest(manifest, script) {
  if (manifest === null || !object(manifest.scripts))
    return false;
  return typeof manifest.scripts[script] === "string";
}
function nodeEngine(manifest) {
  if (manifest === null || !object(manifest.engines))
    return null;
  return typeof manifest.engines.node === "string" ? manifest.engines.node : null;
}

// packages/runner/src/cli-flag.ts
function quotedFlag(source, flag) {
  const escaped = flag.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  return new RegExp(`["'\`]${escaped}["'\`]`, "u").test(source);
}
function binPath(manifest) {
  if (!manifest)
    return null;
  if (typeof manifest.bin === "string")
    return manifest.bin;
  if (typeof manifest.bin !== "object" || manifest.bin === null || Array.isArray(manifest.bin))
    return null;
  const first = Object.values(manifest.bin)[0];
  return typeof first === "string" ? first : null;
}
async function runCliFlag(flag, snapshot, cwd) {
  const startedAt = performance2.now();
  const listed = snapshot.trackedPaths();
  if (!listed.ok)
    return {
      status: "unverified",
      expected: `${flag} literal in source`,
      actual: listed.error.code,
      durationMs: 0
    };
  let found = false;
  for (const path of listed.value) {
    if (!/\.(?:js|jsx|ts|tsx|py)$/u.test(path) || /(^|\/)(?:node_modules|dist|build)(\/|$)/u.test(path))
      continue;
    const read = snapshot.readText(path);
    if (read.ok && read.value !== null && quotedFlag(read.value, flag))
      found = true;
  }
  if (!found)
    return {
      status: "fail",
      expected: `${flag} literal in source`,
      actual: "Flag not found",
      durationMs: performance2.now() - startedAt
    };
  const manifest = readManifest(snapshot);
  if (!manifest.ok)
    return {
      status: "unverified",
      expected: `${flag} literal in source`,
      actual: manifest.error.code,
      durationMs: performance2.now() - startedAt
    };
  const executable = binPath(manifest.value);
  if (!executable)
    return {
      status: "pass",
      expected: `${flag} literal in source`,
      actual: "Flag found",
      durationMs: performance2.now() - startedAt
    };
  if (!/^[A-Za-z0-9_./-]+$/u.test(executable) || executable.includes(".."))
    return {
      status: "unverified",
      expected: "Safe bin path",
      actual: "Invalid package bin path",
      durationMs: performance2.now() - startedAt
    };
  const help = await runCommand(`node ${executable} --help`, cwd);
  const pass = (help.status === "pass" || help.status === "flaky") && help.actual.includes(flag);
  return {
    status: pass ? help.status : "fail",
    expected: `${flag} in --help`,
    actual: help.actual,
    durationMs: performance2.now() - startedAt
  };
}

// packages/runner/src/command-provenance.ts
function fencedCommand(text, command) {
  let marker = "";
  let width = 0;
  for (const line of text.split(/\r?\n/u)) {
    const match = /^\s*(`{3,}|~{3,})/u.exec(line);
    if (match?.[1]) {
      const fence = match[1];
      if (!marker) {
        marker = fence[0] ?? "";
        width = fence.length;
      } else if (fence[0] === marker && fence.length >= width) {
        marker = "";
        width = 0;
      }
      continue;
    }
    if (marker && line.includes(command))
      return true;
  }
  return false;
}
function packageScript(snapshot, command) {
  const read = snapshot.readText("package.json");
  if (!read.ok || read.value === null)
    return false;
  try {
    const parsed = JSON.parse(read.value);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
      return false;
    const scripts = "scripts" in parsed ? parsed.scripts : null;
    if (typeof scripts !== "object" || scripts === null || Array.isArray(scripts))
      return false;
    return Object.values(scripts).some((value) => value === command);
  } catch {
    return false;
  }
}
function commandHasProvenance(claim, command, snapshot) {
  if (packageScript(snapshot, command))
    return true;
  for (const occurrence of claim.occurrences) {
    if (occurrence.location.kind !== "file")
      continue;
    const read = snapshot.readText(occurrence.location.path);
    if (read.ok && read.value !== null && fencedCommand(read.value, command))
      return true;
  }
  return false;
}

// packages/runner/src/server.ts
import { createConnection } from "node:net";
import { performance as performance3 } from "node:perf_hooks";
function trimOutput(output) {
  return output.split(/\r?\n/u).slice(0, 20).join(`
`).trim();
}
function canConnect(port) {
  return new Promise((resolve) => {
    const socket = createConnection({ host: "127.0.0.1", port });
    socket.setTimeout(portPollIntervalMs);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });
}
async function rootResponds(port) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/`, {
      signal: AbortSignal.timeout(1000)
    });
    return response.status < 500;
  } catch {
    return false;
  }
}
async function waitForPort(port, timeoutMs) {
  const deadline = performance3.now() + timeoutMs;
  while (performance3.now() < deadline) {
    if (await canConnect(port) && await rootResponds(port))
      return true;
    await new Promise((resolve) => setTimeout(resolve, portPollIntervalMs));
  }
  return false;
}
async function waitForPortRelease(port) {
  const deadline = performance3.now() + cleanupTimeoutMs;
  while (performance3.now() < deadline) {
    if (!await canConnect(port))
      return true;
    await new Promise((resolve) => setTimeout(resolve, cleanupPollIntervalMs));
  }
  return false;
}
async function checkPort(input, handle) {
  const startedAt = performance3.now();
  const passed = await waitForPort(input.port, input.timeoutMs ?? startTimeoutMs);
  return {
    status: passed ? "pass" : "fail",
    expected: `TCP and GET / on port ${input.port} with status below 500`,
    actual: passed ? `Port ${input.port} responded` : `No healthy response on port ${input.port}; ${trimOutput(handle.output())}`,
    durationMs: performance3.now() - startedAt
  };
}
async function checkHttp(input, port) {
  const startedAt = performance3.now();
  const expected = `${input.method} ${input.path}: status ${input.expectedStatus} and JSON keys ${input.expectedKeys.join(", ")}`;
  try {
    const response = await fetch(`http://127.0.0.1:${port}${input.path}`, {
      method: input.method,
      signal: AbortSignal.timeout(3000)
    });
    const body = await response.json();
    const keys = typeof body === "object" && body !== null && !Array.isArray(body) ? Object.keys(body) : [];
    const passed = response.status === input.expectedStatus && input.expectedKeys.every((key) => keys.includes(key));
    return {
      status: passed ? "pass" : "fail",
      expected,
      actual: `Status ${response.status}; keys ${keys.join(", ")}`,
      durationMs: performance3.now() - startedAt
    };
  } catch (error) {
    return {
      status: "fail",
      expected,
      actual: error instanceof Error ? error.message : "Request failed",
      durationMs: performance3.now() - startedAt
    };
  }
}
async function serverSession(ports, examples, cwd) {
  const results = {};
  const script = ports[0]?.startScript;
  if (!script || !/^[A-Za-z0-9:_-]+$/u.test(script) || ports.some((item) => item.startScript !== script)) {
    for (const item of [...ports, ...examples])
      results[item.id] = {
        status: "unverified",
        expected: "Safe start script",
        actual: "No safe start script",
        durationMs: 0
      };
    return results;
  }
  const occupied = [];
  for (const item of ports)
    if (await canConnect(item.port))
      occupied.push(item.port);
  if (occupied.length > 0) {
    for (const item of ports)
      results[item.id] = {
        status: "unverified",
        expected: `Port ${item.port} free before start`,
        actual: `Port ${occupied.join(", ")} occupied before the project started`,
        durationMs: 0
      };
    for (const item of examples)
      results[item.id] = {
        status: "skipped",
        expected: "Project server is running",
        actual: "Port belongs to another process",
        durationMs: 0
      };
    return results;
  }
  const started = await startProjectProcess("npm", ["run", script], cwd, true);
  if (!started.ok) {
    for (const item of ports)
      results[item.id] = {
        status: "fail",
        expected: `npm run ${script}`,
        actual: started.error.message,
        durationMs: 0
      };
    for (const item of examples)
      results[item.id] = {
        status: "skipped",
        expected: "Server is running",
        actual: "Start failed",
        durationMs: 0
      };
    return results;
  }
  const outcomes = await withProcess(started.value, async (handle) => {
    for (const item of ports)
      results[item.id] = await checkPort(item, handle);
    const mainPort = ports[0];
    const ready = mainPort && results[mainPort.id]?.status === "pass";
    for (const item of examples)
      results[item.id] = ready && mainPort ? await checkHttp(item, mainPort.port) : {
        status: "skipped",
        expected: "Server is running",
        actual: "Port check failed",
        durationMs: 0
      };
    return results;
  });
  if (ports[0] && !await waitForPortRelease(ports[0].port))
    throw new Error(`Server did not release port ${ports[0].port}`);
  return outcomes;
}
async function runServerChecks(ports, examples, cwd) {
  if (ports.length === 0 && examples.length === 0)
    return {};
  const first = await serverSession(ports, examples, cwd);
  if (!Object.values(first).some((result) => result.status === "fail"))
    return first;
  const second = await serverSession(ports, examples, cwd);
  const merged = {};
  for (const item of [...ports, ...examples]) {
    const before = first[item.id];
    const after = second[item.id];
    if (!after)
      continue;
    merged[item.id] = before?.status === "fail" && after.status === "pass" ? {
      ...after,
      status: "flaky",
      actual: `Passed after restart. First: ${before.actual}`
    } : after;
  }
  return merged;
}

// packages/runner/src/snapshot.ts
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, resolve, sep } from "node:path";
function inside(root, target) {
  return target === root || target.startsWith(`${root}${sep}`);
}
function safeTarget(root, path) {
  if (isAbsolute(path) || /^[A-Za-z]:/.test(path) || path.includes("\x00")) {
    return { ok: false, error: { code: "unsafe_path", path } };
  }
  const target = resolve(root, path);
  if (!inside(root, target))
    return { ok: false, error: { code: "unsafe_path", path } };
  if (!existsSync(target))
    return { ok: true, value: target };
  try {
    const resolved = realpathSync(target);
    if (!inside(root, resolved))
      return { ok: false, error: { code: "unsafe_path", path } };
    return { ok: true, value: target };
  } catch {
    return { ok: false, error: { code: "io_error", path } };
  }
}
function diskSnapshot(root, paths) {
  return {
    pathExists: (path) => {
      const target = safeTarget(root, path);
      return target.ok ? { ok: true, value: existsSync(target.value) } : target;
    },
    readText: (path) => {
      const target = safeTarget(root, path);
      if (!target.ok)
        return target;
      if (!existsSync(target.value))
        return { ok: true, value: null };
      try {
        return { ok: true, value: readFileSync(target.value, "utf8") };
      } catch {
        return { ok: false, error: { code: "io_error", path } };
      }
    },
    trackedPaths: () => ({ ok: true, value: paths })
  };
}
function fileSystemSnapshot(rootPath, trackedPaths) {
  try {
    return {
      ok: true,
      value: diskSnapshot(realpathSync(rootPath), [...trackedPaths])
    };
  } catch {
    return { ok: false, error: { code: "io_error", path: rootPath } };
  }
}

// packages/runner/src/code-scan.ts
var sourceExtension = /\.(?:js|jsx|ts|tsx)$/i;
var ignoredSegment = /(?:^|\/)(?:node_modules|dist|build)(?:\/|$)/i;
var nonCode = /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|\/\/[^\r\n]*|\/\*[\s\S]*?\*\/|\/(?:\\.|\[(?:\\.|[^\]\\])*\]|[^/[\r\n\\])+\/[dgimsuvy]*/g;
function sourcePath(path) {
  const slashPath = path.replaceAll("\\", "/");
  return sourceExtension.test(slashPath) && !ignoredSegment.test(slashPath);
}
function maskNonCode(text, keepBracketStrings) {
  return text.replace(nonCode, (match, offset) => {
    const quote = match[0] === "'" || match[0] === '"';
    if (quote && keepBracketStrings && /\bprocess\.env\s*\[\s*$/.test(text.slice(0, offset))) {
      return match;
    }
    return match.replace(/[^\r\n]/g, " ");
  });
}
function escaped(name) {
  return name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function declaresName(code, name) {
  const token = escaped(name);
  const declaration = new RegExp(`\\b(?:function|class|interface|type|enum|const|let|var)\\s+${token}\\b`);
  const namedExport = new RegExp(`\\bexport\\s*\\{[^}]*\\b${token}\\b[^}]*\\}`);
  const commonJs = new RegExp(`\\b(?:module\\.exports|exports)\\.${token}\\s*=`);
  return declaration.test(code) || namedExport.test(code) || commonJs.test(code);
}
function readsEnvironment(code, name) {
  return environmentNames(code).includes(name);
}
function environmentNames(code) {
  const pattern = /\b(?:process|import\.meta)\.env\.([A-Za-z_][A-Za-z0-9_]*)\b|\bprocess\.env\[\s*['"]([A-Za-z_][A-Za-z0-9_]*)['"]\s*\]/g;
  const names = [];
  for (const match of code.matchAll(pattern)) {
    const offset = match.index + match[0].length;
    const suffix = code.slice(offset).trimStart();
    const prefix = code.slice(0, match.index).trimEnd();
    if (/^=(?!=|>)/.test(suffix) || /\bdelete$/.test(prefix))
      continue;
    const name = match[1] ?? match[2];
    if (name !== undefined)
      names.push(name);
  }
  return names;
}
function matchingSourcePaths(snapshot, name, kind) {
  const listed = snapshot.trackedPaths();
  if (!listed.ok)
    return snapshotFail(listed.error);
  const matches = [];
  for (const path of listed.value.filter(sourcePath)) {
    const read = snapshot.readText(path);
    if (!read.ok)
      return snapshotFail(read.error);
    if (read.value === null)
      continue;
    const code = maskNonCode(read.value, kind === "env_var");
    const found = kind === "env_var" ? readsEnvironment(code, name) : declaresName(code, name);
    if (found)
      matches.push(path);
  }
  return ok(matches);
}

// packages/runner/src/version.ts
var import_semver = __toESM(require_semver2(), 1);
function versionFile(snapshot, path) {
  const read = snapshot.readText(path);
  if (!read.ok)
    return snapshotFail(read.error);
  const range = read.value?.split(/\r?\n/).map((line) => line.trim()).find(Boolean);
  return ok(range ? { path, range } : null);
}
function projectConstraints(snapshot) {
  const manifest = readManifest(snapshot);
  if (!manifest.ok)
    return manifest;
  const constraints = [];
  const engine = nodeEngine(manifest.value);
  if (engine)
    constraints.push({ path: "package.json#engines.node", range: engine });
  for (const path of [".nvmrc", ".node-version"]) {
    const found = versionFile(snapshot, path);
    if (!found.ok)
      return found;
    if (found.value)
      constraints.push(found.value);
  }
  return ok(constraints);
}
function checkVersion(snapshot, range) {
  if (range.trim().length === 0 || import_semver.validRange(range) === null)
    return fail("invalid_range", range);
  const listed = projectConstraints(snapshot);
  if (!listed.ok)
    return listed;
  if (listed.value.length === 0) {
    return ok({
      kind: "version",
      status: "unverified",
      range,
      constraints: []
    });
  }
  for (const constraint of listed.value) {
    if (import_semver.validRange(constraint.range) === null)
      return fail("invalid_range", constraint.path);
  }
  const combined = listed.value.map((item) => item.range).join(" ");
  const status = import_semver.intersects(range, combined) ? "pass" : "fail";
  return ok({ kind: "version", status, range, constraints: listed.value });
}

// packages/runner/src/static.ts
function validPath(path) {
  return path.length > 0 && !path.startsWith("/") && !path.includes("\\") && !path.includes(":") && !path.includes("\x00") && path.split("/").every((part) => part !== "" && part !== "." && part !== "..");
}
function fileExists(snapshot, path) {
  if (!validPath(path))
    return fail("invalid_path", path);
  const found = snapshot.pathExists(path);
  if (!found.ok)
    return snapshotFail(found.error);
  return ok({
    kind: "file_exists",
    status: found.value ? "pass" : "fail",
    path
  });
}
function scriptExists(snapshot, script) {
  if (script.length === 0)
    return fail("invalid_identifier", script);
  const manifest = readManifest(snapshot);
  if (!manifest.ok)
    return manifest;
  const exists = scriptInManifest(manifest.value, script);
  return ok({
    kind: "script_exists",
    status: exists ? "pass" : "fail",
    script
  });
}
function namedSourceCheck(snapshot, name, kind) {
  const valid = kind === "env_var" ? /^[A-Za-z_][A-Za-z0-9_]*$/ : /^[A-Za-z_$][\w$]*$/;
  if (!valid.test(name))
    return fail("invalid_identifier", name);
  const matches = matchingSourcePaths(snapshot, name, kind);
  if (!matches.ok)
    return matches;
  const status = matches.value.length > 0 ? "pass" : "fail";
  return ok({ kind, status, name, matches: matches.value });
}
function runStaticCheck(check, snapshot) {
  switch (check.kind) {
    case "file_exists":
      return fileExists(snapshot, check.params.path);
    case "script_exists":
      return scriptExists(snapshot, check.params.script);
    case "code_reference":
      return namedSourceCheck(snapshot, check.params.name, check.kind);
    case "env_var":
      return namedSourceCheck(snapshot, check.params.name, check.kind);
    case "version":
      return checkVersion(snapshot, check.params.range);
  }
}

// packages/runner/src/run-plan.ts
var ignoredDirectories = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "flightchecks"
]);
function pathsUnder(root, directory = root) {
  const paths = [];
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    if (item.isDirectory()) {
      if (!ignoredDirectories.has(item.name))
        paths.push(...pathsUnder(root, join(directory, item.name)));
    } else if (item.isFile()) {
      paths.push(relative(root, join(directory, item.name)).replaceAll("\\", "/"));
    }
  }
  return paths;
}
function staticOutcome(claim, snapshot) {
  const startedAt = performance4.now();
  const result = runStaticCheck(claim, snapshot);
  if (!result.ok)
    return {
      status: "unverified",
      expected: claim.kind,
      actual: result.error.code,
      durationMs: performance4.now() - startedAt
    };
  return {
    status: result.value.status,
    expected: claim.kind,
    actual: JSON.stringify(result.value),
    durationMs: performance4.now() - startedAt
  };
}
function portInput(claim) {
  return {
    id: claim.id,
    port: claim.params.port,
    startScript: claim.params.startScript,
    ...claim.params.timeoutMs === undefined ? {} : { timeoutMs: claim.params.timeoutMs }
  };
}
function httpInput(claim) {
  return {
    id: claim.id,
    method: claim.params.method,
    path: claim.params.path,
    expectedStatus: claim.params.expectedStatus,
    expectedKeys: claim.params.expectedKeys
  };
}
async function runPlan(plan, cwd = process.cwd()) {
  const snapshotResult = fileSystemSnapshot(cwd, pathsUnder(cwd));
  if (!snapshotResult.ok)
    throw new Error(`Unable to inspect repository: ${snapshotResult.error.code}`);
  const snapshot = snapshotResult.value;
  const results = {};
  const ports = [];
  const examples = [];
  for (const claim of plan.claims) {
    switch (claim.kind) {
      case "file_exists":
      case "script_exists":
      case "code_reference":
      case "env_var":
      case "version":
        results[claim.id] = staticOutcome(claim, snapshot);
        break;
      case "cli_flag":
        results[claim.id] = await runCliFlag(claim.params.flag, snapshot, cwd);
        break;
      case "command_succeeds":
        results[claim.id] = commandHasProvenance(claim, claim.params.command, snapshot) ? await runCommand(claim.params.command, cwd, claim.params.timeoutMs) : {
          status: "unverified",
          expected: "Command in a cited code block or package script",
          actual: "Command provenance was not found",
          durationMs: 0
        };
        break;
      case "port_listens":
        if (commandHasProvenance(claim, `npm run ${claim.params.startScript}`, snapshot))
          ports.push(portInput(claim));
        else
          results[claim.id] = {
            status: "unverified",
            expected: "Start command in a cited code block or package script",
            actual: "Command provenance was not found",
            durationMs: 0
          };
        break;
      case "http_example":
        examples.push(httpInput(claim));
        break;
    }
  }
  Object.assign(results, await runServerChecks(ports, examples, cwd));
  return results;
}
export {
  runPlan
};
