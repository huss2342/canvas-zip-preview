# Publish Canvas ZIP Preview to the Chrome Web Store

`chrome://extensions` is for testing an unpacked extension. Public distribution happens in the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

## Before uploading

1. Review the current local changes, commit them, and push them to the public GitHub repository. The updated [privacy policy](PRIVACY.md) must be publicly reachable before submitting the listing. The release ZIP is intentionally ignored by Git.
2. Run `npm test`, then `npm run build:release` in the repository root. Upload **`canvas-zip-preview-v1.2.0.zip`**. The builder includes only the manifest, extension scripts/styles, popup, and PNG icons. Do not upload a source-repository ZIP or one of the older release ZIPs.
3. Test that exact package: extract the new ZIP into a clean temporary folder, open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select that extracted folder. In an authorized Canvas SpeedGrader session, open a ZIP submission, inspect a text file and an image, try search and window resizing, then close and reopen the preview. Use test/synthetic submissions where possible. The synthetic [demo page](store/demo.html) is useful for checking appearance, but it does not exercise Canvas authentication or redirect behavior.
4. Confirm the current feature scope: this version runs on hosted `*.instructure.com` Canvas sites. Fully custom Canvas domains need a future permission update. Stored and Deflate entries can be previewed; encrypted entries can only be listed. The archive limit is 250 MB.

## Create the store item

1. Register a Chrome Web Store developer account in the [Developer Dashboard](https://chrome.google.com/webstore/devconsole), pay the one-time registration fee, and enable two-step verification on that Google account. Keep the account email monitored for review and policy notices.
2. Click **Add new item**, upload `canvas-zip-preview-v1.2.0.zip`, and complete the **Store Listing**, **Privacy**, **Distribution**, and **Test instructions** tabs. Google's [publishing guide](https://developer.chrome.com/docs/webstore/publish/) shows the current dashboard flow.
3. Use the copy below as a starting point. Match every declaration to the dashboard's current wording and the uploaded ZIP.

### Store listing copy

**Name:** Canvas ZIP Preview

**Category:** Education

**Short description:** Preview ZIP submissions in Canvas SpeedGrader without saving or extracting files.

**Detailed description:**

> Canvas ZIP Preview adds a Preview ZIP button beside ZIP submissions in Canvas SpeedGrader. Browse filenames and folders, search the archive, and inspect supported text, code, images, and binary data in the grading page.
>
> The extension processes the selected archive locally in your browser. It does not send student submissions to the developer, run analytics, show ads, or require an account. The only network requests are for the selected attachment through Canvas and the storage location Canvas provides. Archive contents are not extracted to disk by the extension.
>
> Supports hosted Canvas sites at `*.instructure.com`. Custom school domains are not yet supported. Stored and Deflate-compressed files can be previewed. Password-encrypted files can be listed but not previewed. Archives are limited to 250 MB.
>
> Independent project. Canvas is a trademark of Instructure, Inc. This extension is not affiliated with, endorsed by, or sponsored by Instructure.

**Website:** `https://github.com/huss2342/canvas-zip-preview`

**Privacy policy:** `https://github.com/huss2342/canvas-zip-preview/blob/main/PRIVACY.md` (check the actual default branch and that the updated file is visible after pushing).

**Support:** The repository's GitHub Issues page, with a clear reminder not to post real student submissions, names, grades, or school URLs. Provide a monitored support email if the dashboard requests one.

**Images:** Upload `icons/icon-128.png` as the store icon, `store/promo-440x280.png` as the small promotional tile, and `store/screenshot-1280x800.png` as the primary screenshot. `store/screenshot-button-1280x800.png` can be a second screenshot. Both screenshots use synthetic data; neither screenshot nor the demo files belong in the extension ZIP. These sizes follow [Chrome's image guidance](https://developer.chrome.com/docs/webstore/images).

### Privacy tab copy

**Single purpose:** Preview ZIP attachments within Canvas SpeedGrader so an authorized grader can inspect their contents in place.

**Permissions:**

| Permission | Reason |
| --- | --- |
| `storage` | Remembers the user's selected preview window size and optional custom width/height. It does not store submission contents. |
| `https://*.instructure.com/*` | Adds the Preview ZIP interface on hosted Canvas pages and requests the attachment selected by the user. |
| `https://*.canvas-user-content.com/*` | Allows a selected Canvas attachment to be downloaded when Canvas directs it to this storage domain. |
| `https://*.amazonaws.com/*` | Allows a selected Canvas attachment to be downloaded when Canvas directs it to Amazon S3 storage. The extension makes no background scans of these sites. |

**Remote code:** No. All executable extension code is packaged in the ZIP; archive contents are shown as data, not run.

**Data handling:** The extension reads the selected attachment's URL, filename, archive directory, metadata, and selected file content in the user's browser. These may include website content, user-generated content, and personal information. It does not transmit those contents to the developer or a developer server. Declare the applicable user-data categories in the dashboard even though processing is local, and certify only statements that match the extension and [privacy policy](PRIVACY.md). Chrome explicitly requires disclosure for locally handled user data in its [user-data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq).

### Distribution and review

1. Select **Free** and **Unlisted** for the first release. Anyone with the URL can install an unlisted extension; it still undergoes Chrome Web Store review. See Google's [visibility guide](https://developer.chrome.com/docs/webstore/cws-dashboard-distribution/).
2. In **Test instructions**, explain that the button appears only beside a `.zip` submission in SpeedGrader. If reviewers need sign-in access, provide a temporary Canvas test account and an assignment containing synthetic ZIP submissions through the dashboard's private reviewer fields. Do not place credentials in the public listing or repository.
3. Submit for review. When approved, share the unlisted store URL with a small group of authorized instructors or TAs. Ask them to get any school/IT approval their institution requires before testing with student records.

## Unlisted beta checklist

Ask 3–5 instructors to use it during real grading for a couple of weeks. Collect only aggregate or synthetic feedback, never student work:

- Did the button appear on their hosted Canvas site? Record only whether the site used a custom domain, not the school URL.
- Did a ZIP download or preview fail? What file type, compression method, and approximate size were involved? Use a synthetic reproduction if they can provide one.
- How many grading sessions did they use it in, and roughly how many minutes did it save per session?
- Which single addition would help most: file comparison, batch file checks, rubric support, or something else?
- Would their school allow an extension like this, and what documentation would IT need?

Fix blockers, increase `manifest.json` and `package.json` to the same new version, rebuild and upload the new ZIP. Once the beta works across the sites and ZIP types your testers use, change the item's visibility to **Public** in the Distribution tab and follow any review prompt. The store listing URL and beta feedback can then guide outreach to Canvas instructor communities.
