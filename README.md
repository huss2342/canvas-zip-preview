# Canvas ZIP Preview

A small, build-free Chrome extension that adds a **Preview ZIP** button beside ZIP submissions in Canvas SpeedGrader.

[MIT licensed](LICENSE) · [Privacy](PRIVACY.md) · [Security](SECURITY.md)

## Install in Chrome (about 30 seconds)

1. Open `chrome://extensions` in Chrome.
2. Turn on **Developer mode** in the top-right corner.
3. Click **Load unpacked**.
4. Select this folder: `canvas_extension_zip`.
5. Reload an open Canvas SpeedGrader tab once.

When a student submitted a `.zip`, click the orange **Preview ZIP** button beside the attachment. The preview stays inside SpeedGrader.

## What it shows

- Every file and folder name, including nested paths
- Compressed and expanded sizes, modified times, compression method, and CRC-32
- Search/filter and a one-click copyable file list
- In-page previews for text, source code, common images, and a hex view for other files
- Normal, large, and full-screen preview window sizes, remembered across sessions, plus drag-to-resize
- Image Fit controls and 25%–400% zoom for screenshots and diagrams
- Warnings for encrypted entries, suspicious extraction paths, and unusually high compression ratios
- ZIP64 directory support and filename decoding for UTF-8 and legacy CP437 archives

Nothing is extracted to disk and nothing is uploaded anywhere. ZIPs are held in the current tab's memory while the preview is open. Individual previews are size-limited, and the entire archive limit is 250 MB.

## Privacy

Student submissions stay on the educator's device. There are no analytics, ads, developer servers, or user accounts. The extension contacts only Canvas and the storage URL Canvas provides for the selected attachment. See the full [privacy policy](PRIVACY.md).

## Supported Canvas sites

The included manifest supports hosted Canvas schools at `*.instructure.com`, including the site shown in the supplied SpeedGrader page. If a school uses a fully custom Canvas domain, add its URL pattern to both `host_permissions` and `content_scripts.matches` in `manifest.json`, then reload the extension.

## Troubleshooting

- **No Preview ZIP button:** reload the SpeedGrader tab after installing the extension, and confirm the submitted filename ends in `.zip`.
- **Download/permission error:** Canvas may store the file on a host not covered by the included permissions. The normal download link still works; add that storage hostname to `host_permissions` if needed.
- **A listed file will not preview:** Stored and Deflate-compressed entries are previewable. Other compression methods and password-encrypted files are still listed with metadata.

## Developer check

Run `npm test` to exercise the ZIP directory parser. There is no build step and no runtime dependency.

Contributions are welcome; please use synthetic files rather than real student work. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Disclaimer

Canvas is a trademark of Instructure, Inc. This independent project is not affiliated with, endorsed by, or sponsored by Instructure.
