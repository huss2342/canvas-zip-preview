# Privacy Policy

Last updated: September 21, 2026

Canvas ZIP Preview has one purpose: letting an authorized Canvas user inspect a ZIP submission inside SpeedGrader.

## Data the extension handles

When the user clicks **Preview ZIP**, the extension reads the selected attachment URL and downloads that ZIP using the user's existing Canvas session. It processes the archive filename, directory, metadata, and user-selected file contents locally in the browser.

Student submissions and attachment metadata may constitute personal, sensitive, or educational-record data. The extension uses that information only to provide the preview requested by the user.

## Collection, transmission, and sharing

The extension:

- does not send submission data to the developer;
- does not operate a developer-controlled server;
- does not use analytics, advertising, tracking pixels, or telemetry;
- does not sell, share, or use submission data for advertising, profiling, or unrelated purposes; and
- contacts only the active Canvas site and the file-storage URL to which Canvas directs the selected download.

## Storage and retention

Archive data is held in the current browser tab's memory while the preview is open. The extension does not write submission contents to extension storage, local storage, IndexedDB, or a user-selected file. Closing the preview or navigating away releases the extension's references so the browser can reclaim that memory. The browser, operating system, Canvas, or its storage provider may independently apply their own normal caching and logging behavior.

## Permissions

Access to `*.instructure.com` lets the extension add its interface to hosted Canvas SpeedGrader pages and request the selected attachment. Access to approved Canvas storage domains lets it follow download redirects. These permissions are not used for background browsing-history collection.

## Institutional requirements

Schools and educators are responsible for deciding whether browser extensions are approved in their environment and for complying with applicable student-privacy rules and institutional policies.

## Changes and questions

Material changes to these practices will be documented in this repository and reflected in the extension version. Open a GitHub issue for general questions, but never attach real student work or identifying information to a public issue.
