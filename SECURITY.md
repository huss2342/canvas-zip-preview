# Security Policy

## Reporting a vulnerability

Please use GitHub's private **Report a vulnerability** feature for security issues. Do not place student submissions, signed Canvas download URLs, session information, or other sensitive data in a public issue.

Include a minimal synthetic ZIP and reproduction steps when possible. Reports involving unsafe ZIP paths, decompression limits, cross-origin downloads, or unintended data retention are especially useful.

## Security design

- Archive entries are never extracted to the filesystem.
- Absolute paths and `..` path traversal segments are flagged.
- Archive and individual-preview size limits reduce decompression-bomb risk.
- Extracted data is checked against the ZIP entry's CRC-32.
- HTML and source files are displayed as text rather than executed.
- SVG is not rendered as an image preview.
- There is no analytics or developer-controlled backend.

This project is provided without warranty. Schools should review and approve browser extensions according to their own security and student-privacy policies.
