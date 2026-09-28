"""Create and verify the Chrome Web Store upload from an explicit file list."""

import json
import struct
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


ROOT = Path(__file__).resolve().parents[1]
FILES = [
    "manifest.json",
    "background.js",
    "zip-reader.js",
    "content.js",
    "content.css",
    "popup.html",
    "icons/icon-16.png",
    "icons/icon-32.png",
    "icons/icon-48.png",
    "icons/icon-128.png",
]


def main():
    manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
    version = manifest["version"]
    package = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
    if package["version"] != version:
        raise ValueError("package.json and manifest.json versions differ")
    if manifest["manifest_version"] != 3:
        raise ValueError("Chrome Web Store release must use Manifest V3")
    referenced = set(manifest["icons"].values())
    referenced.update(manifest["action"]["default_icon"].values())
    referenced.add(manifest["action"]["default_popup"])
    referenced.add(manifest["background"]["service_worker"])
    for content_script in manifest["content_scripts"]:
        referenced.update(content_script.get("js", []))
        referenced.update(content_script.get("css", []))
    if referenced - set(FILES):
        raise ValueError(f"Manifest references unpackaged files: {referenced - set(FILES)}")
    if not all((ROOT / name).is_file() for name in FILES):
        missing = [name for name in FILES if not (ROOT / name).is_file()]
        raise FileNotFoundError(f"Missing release files: {missing}")
    for size in (16, 32, 48, 128):
        header = (ROOT / f"icons/icon-{size}.png").read_bytes()[:24]
        if header[:8] != b"\x89PNG\r\n\x1a\n" or struct.unpack(">II", header[16:24]) != (size, size):
            raise ValueError(f"Icon {size} must be a {size}x{size} PNG")

    output = ROOT / f"canvas-zip-preview-v{version}.zip"
    with ZipFile(output, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for name in FILES:
            archive.write(ROOT / name, arcname=name)

    with ZipFile(output) as archive:
        if archive.namelist() != FILES or archive.testzip() is not None:
            raise ValueError("Release ZIP failed integrity or content check")
        packaged_manifest = json.loads(archive.read("manifest.json"))
        if packaged_manifest != manifest:
            raise ValueError("Packaged manifest differs from source")

    print(f"Built {output.name} ({output.stat().st_size:,} bytes)")
    print("Included files:")
    for name in FILES:
        print(f"  {name}")


if __name__ == "__main__":
    main()
