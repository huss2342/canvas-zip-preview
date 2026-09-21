(function canvasZipPreview() {
  "use strict";

  const { ZipArchive, formatBytes } = globalThis.CanvasZipReader;
  const MAX_ARCHIVE_BYTES = 250 * 1024 * 1024;
  const MAX_TEXT_PREVIEW = 2 * 1024 * 1024;
  const MAX_IMAGE_PREVIEW = 12 * 1024 * 1024;
  const TEXT_EXTENSIONS = new Set([
    "txt", "md", "markdown", "csv", "tsv", "json", "jsonl", "xml", "yaml", "yml", "toml", "ini", "cfg", "conf",
    "html", "htm", "css", "scss", "sass", "less", "js", "jsx", "mjs", "cjs", "ts", "tsx", "vue", "svelte",
    "py", "pyw", "java", "kt", "kts", "c", "h", "cc", "cpp", "cxx", "hpp", "cs", "go", "rs", "rb", "php",
    "swift", "sh", "bash", "zsh", "fish", "ps1", "bat", "cmd", "sql", "r", "lua", "pl", "pm", "ex", "exs",
    "asm", "s", "gradle", "properties", "env", "gitignore", "dockerfile", "makefile", "log"
  ]);
  const IMAGE_TYPES = new Map([
    ["png", "image/png"], ["jpg", "image/jpeg"], ["jpeg", "image/jpeg"], ["gif", "image/gif"],
    ["webp", "image/webp"], ["bmp", "image/bmp"], ["ico", "image/x-icon"], ["avif", "image/avif"]
  ]);

  let activePanel = null;
  let activeAttachment = null;
  let activeObjectUrl = null;
  let scanQueued = false;

  const observer = new MutationObserver(() => {
    queueScan();
    if (activePanel && activeAttachment && !activeAttachment.isConnected) closePanel();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  queueScan();

  function queueScan() {
    if (scanQueued) return;
    scanQueued = true;
    requestAnimationFrame(() => {
      scanQueued = false;
      injectPreviewButtons();
    });
  }

  function injectPreviewButtons() {
    const lists = document.querySelectorAll('[data-testid="submission-attachments"] li, #submission-attachments li');
    for (const item of lists) {
      if (item.querySelector(".czp-preview-button")) continue;
      const download = item.querySelector('a[href*="/download"], a[id^="submission-attachment-download-"]');
      if (!download) continue;
      const fileName = findFileName(item, download);
      if (!/\.zip$/i.test(fileName)) continue;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "czp-preview-button";
      button.innerHTML = `${zipIcon()}<span>Preview ZIP</span>`;
      button.title = `Inspect files inside ${fileName}`;
      button.addEventListener("click", () => openArchive(download.href, fileName, item));

      const actionHost = download.parentElement || item;
      actionHost.insertBefore(button, download);
    }
  }

  function findFileName(item, download) {
    const named = item.querySelector('button[id^="submission-attachment-link-"], [data-cid="TruncateText"]');
    const text = named?.textContent?.trim();
    if (text) return text;
    try {
      return decodeURIComponent(new URL(download.href).pathname.split("/").pop() || "submission.zip");
    } catch {
      return "submission.zip";
    }
  }

  async function openArchive(url, fileName, attachment) {
    closePanel();
    activeAttachment = attachment;
    const panel = createPanel(fileName);
    activePanel = panel;
    document.body.append(panel);
    panel.querySelector(".czp-close").focus();

    try {
      setLoading(panel, "Downloading securely from Canvas…", 0);
      const buffer = await downloadArchive(url, (loaded, total) => {
        const percent = total ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
        setLoading(panel, total ? `Downloading ${formatBytes(loaded)} of ${formatBytes(total)}…` : `Downloading ${formatBytes(loaded)}…`, percent);
      });
      if (buffer.byteLength > MAX_ARCHIVE_BYTES) {
        throw new Error(`This archive is ${formatBytes(buffer.byteLength)}. The in-browser limit is ${formatBytes(MAX_ARCHIVE_BYTES)}.`);
      }
      setLoading(panel, "Reading ZIP directory…", 100);
      const archive = new ZipArchive(buffer);
      renderArchive(panel, archive, fileName, buffer.byteLength);
    } catch (error) {
      renderError(panel, error?.message || "The ZIP could not be opened.");
    }
  }

  async function downloadArchive(url, onProgress) {
    try {
      const response = await fetch(url, { credentials: "include", redirect: "follow" });
      if (!response.ok) throw new Error(`Canvas returned HTTP ${response.status}.`);
      return await readResponse(response, onProgress);
    } catch (pageFetchError) {
      try {
        return await backgroundFetch(url, onProgress);
      } catch (backgroundError) {
        throw new Error(`${backgroundError.message || pageFetchError.message} If Canvas opened the file in another tab, reload SpeedGrader and try again.`);
      }
    }
  }

  async function readResponse(response, onProgress) {
    const total = Number(response.headers.get("content-length")) || 0;
    if (total > MAX_ARCHIVE_BYTES) throw new Error(`This archive exceeds the ${formatBytes(MAX_ARCHIVE_BYTES)} limit.`);
    if (!response.body) return response.arrayBuffer();
    const reader = response.body.getReader();
    const chunks = [];
    let loaded = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      loaded += value.byteLength;
      if (loaded > MAX_ARCHIVE_BYTES) {
        await reader.cancel();
        throw new Error(`This archive exceeds the ${formatBytes(MAX_ARCHIVE_BYTES)} limit.`);
      }
      chunks.push(value);
      onProgress(loaded, total);
    }
    return joinChunks(chunks, loaded).buffer;
  }

  function backgroundFetch(url, onProgress) {
    return new Promise((resolve, reject) => {
      const port = chrome.runtime.connect({ name: "canvas-zip-fetch" });
      const chunks = [];
      let total = 0;
      let expected = 0;
      let settled = false;
      const fail = (message) => {
        if (settled) return;
        settled = true;
        port.disconnect();
        reject(new Error(message));
      };
      port.onDisconnect.addListener(() => {
        if (!settled) fail(chrome.runtime.lastError?.message || "The background download stopped.");
      });
      port.onMessage.addListener((message) => {
        if (message.type === "start") {
          expected = message.total || 0;
          if (expected > MAX_ARCHIVE_BYTES) fail(`This archive exceeds the ${formatBytes(MAX_ARCHIVE_BYTES)} limit.`);
        } else if (message.type === "chunk") {
          const chunk = base64ToBytes(message.data);
          chunks.push(chunk);
          total += chunk.byteLength;
          if (total > MAX_ARCHIVE_BYTES) fail(`This archive exceeds the ${formatBytes(MAX_ARCHIVE_BYTES)} limit.`);
          else onProgress(total, expected);
        } else if (message.type === "done") {
          settled = true;
          port.disconnect();
          resolve(joinChunks(chunks, total).buffer);
        } else if (message.type === "error") {
          fail(message.message || "The background download failed.");
        }
      });
      port.postMessage({ type: "fetch", url });
    });
  }

  function createPanel(fileName) {
    const panel = document.createElement("section");
    panel.className = "czp-panel";
    panel.dataset.size = "normal";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "false");
    panel.setAttribute("aria-label", `ZIP preview: ${fileName}`);
    panel.innerHTML = `
      <header class="czp-header">
        <div class="czp-title-wrap">
          <span class="czp-logo" aria-hidden="true">${zipIcon()}</span>
          <div><div class="czp-kicker">CANVAS ZIP PREVIEW</div><h2 title="${escapeHtml(fileName)}">${escapeHtml(fileName)}</h2></div>
        </div>
        <div class="czp-header-actions">
          <label class="czp-window-size">
            <span>Window</span>
            <select aria-label="Preview window size">
              <option value="normal">Normal</option>
              <option value="large">Large</option>
              <option value="full">Full screen</option>
            </select>
          </label>
          <button class="czp-close" type="button" aria-label="Close ZIP preview">${closeIcon()}</button>
        </div>
      </header>
      <div class="czp-body">
        <div class="czp-loading" role="status">
          <div class="czp-spinner" aria-hidden="true"></div>
          <div class="czp-loading-message">Preparing preview…</div>
          <div class="czp-progress"><i></i></div>
        </div>
      </div>`;
    panel.querySelector(".czp-close").addEventListener("click", closePanel);
    panel.querySelector(".czp-window-size select").addEventListener("change", (event) => {
      panel.style.removeProperty("width");
      panel.style.removeProperty("height");
      panel.dataset.size = event.currentTarget.value;
    });
    panel.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closePanel();
    });
    return panel;
  }

  function setLoading(panel, message, percent) {
    if (panel !== activePanel) return;
    const label = panel.querySelector(".czp-loading-message");
    const bar = panel.querySelector(".czp-progress i");
    if (label) label.textContent = message;
    if (bar) bar.style.width = `${percent || 0}%`;
  }

  function renderArchive(panel, archive, fileName, archiveBytes) {
    if (panel !== activePanel) return;
    const body = panel.querySelector(".czp-body");
    const files = archive.entries.filter((entry) => !entry.isDirectory);
    const directories = archive.entries.filter((entry) => entry.isDirectory);
    const expandedBytes = files.reduce((sum, entry) => sum + entry.uncompressedSize, 0);
    const packedBytes = files.reduce((sum, entry) => sum + entry.compressedSize, 0);
    const unsafeCount = archive.entries.filter((entry) => !entry.pathSafety.safe).length;
    const encryptedCount = files.filter((entry) => entry.encrypted).length;
    const supportedCount = files.filter((entry) => !entry.encrypted && (entry.method === 0 || entry.method === 8)).length;

    body.innerHTML = `
      <div class="czp-summary">
        ${statCard("Files", files.length.toLocaleString())}
        ${statCard("Folders", directories.length.toLocaleString())}
        ${statCard("Expanded", formatBytes(expandedBytes))}
        ${statCard("ZIP size", formatBytes(archiveBytes))}
      </div>
      <div class="czp-toolbar">
        <label class="czp-search">${searchIcon()}<span class="czp-sr-only">Filter files</span><input type="search" placeholder="Filter filenames…" autocomplete="off"></label>
        <button type="button" class="czp-copy">${copyIcon()}<span>Copy file list</span></button>
      </div>
      <div class="czp-notices" aria-live="polite"></div>
      <div class="czp-workspace">
        <div class="czp-list-pane">
          <div class="czp-list-heading"><span>Archive contents</span><span>${files.length + directories.length} entries</span></div>
          <div class="czp-file-list" role="listbox" aria-label="Files in ${escapeHtml(fileName)}"></div>
          <div class="czp-empty" hidden>No filenames match that filter.</div>
        </div>
        <div class="czp-detail-pane">
          <div class="czp-welcome">
            <div class="czp-welcome-icon">${documentIcon()}</div>
            <h3>Select a file</h3>
            <p>See metadata and preview supported text, code, and image files without leaving SpeedGrader.</p>
            <div class="czp-capability">${supportedCount} of ${files.length} files use a supported ZIP compression method</div>
          </div>
        </div>
      </div>`;

    const notices = body.querySelector(".czp-notices");
    if (unsafeCount) notices.append(makeNotice("danger", `${unsafeCount} unsafe path${unsafeCount === 1 ? "" : "s"} detected (absolute path or “..”). Nothing is extracted to disk.`));
    if (encryptedCount) notices.append(makeNotice("warning", `${encryptedCount} encrypted file${encryptedCount === 1 ? "" : "s"} can be listed but not previewed.`));
    if (archive.comment) notices.append(makeNotice("info", `Archive comment: ${archive.comment}`));
    if (expandedBytes > packedBytes * 100 && expandedBytes > 50 * 1024 * 1024) notices.append(makeNotice("warning", "Very high compression ratio detected. Individual preview limits remain active."));

    const list = body.querySelector(".czp-file-list");
    renderEntryList(list, archive.entries, archive, panel);

    const search = body.querySelector(".czp-search input");
    search.addEventListener("input", () => {
      const query = search.value.trim().toLocaleLowerCase();
      let shown = 0;
      for (const row of list.children) {
        const visible = !query || row.dataset.name.includes(query);
        row.hidden = !visible;
        if (visible) shown += 1;
      }
      body.querySelector(".czp-empty").hidden = shown !== 0;
    });

    const copyButton = body.querySelector(".czp-copy");
    copyButton.addEventListener("click", async () => {
      const text = archive.entries.map((entry) => `${entry.isDirectory ? "[folder]" : formatBytes(entry.uncompressedSize).padStart(10)}  ${entry.name}`).join("\n");
      try {
        await navigator.clipboard.writeText(text);
        copyButton.querySelector("span").textContent = "Copied!";
        setTimeout(() => { if (copyButton.isConnected) copyButton.querySelector("span").textContent = "Copy file list"; }, 1500);
      } catch {
        copyButton.querySelector("span").textContent = "Copy failed";
      }
    });
  }

  function renderEntryList(list, entries, archive, panel) {
    const fragment = document.createDocumentFragment();
    entries.forEach((entry) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = `czp-file-row${entry.isDirectory ? " is-directory" : ""}${entry.pathSafety.safe ? "" : " is-unsafe"}`;
      row.setAttribute("role", "option");
      row.dataset.name = entry.name.toLocaleLowerCase();
      row.style.setProperty("--depth", Math.min(entry.depth, 8));
      row.innerHTML = `
        <span class="czp-file-icon">${entryIcon(entry)}</span>
        <span class="czp-file-main"><span class="czp-file-name" title="${escapeHtml(entry.name)}">${escapeHtml(entry.basename || entry.name)}</span><span class="czp-file-path">${escapeHtml(parentPath(entry.name))}</span></span>
        <span class="czp-file-size">${entry.isDirectory ? "folder" : formatBytes(entry.uncompressedSize)}</span>`;
      row.addEventListener("click", () => {
        list.querySelector('[aria-selected="true"]')?.setAttribute("aria-selected", "false");
        row.setAttribute("aria-selected", "true");
        showEntry(panel, archive, entry);
      });
      fragment.append(row);
    });
    list.append(fragment);
  }

  async function showEntry(panel, archive, entry) {
    if (activeObjectUrl) {
      URL.revokeObjectURL(activeObjectUrl);
      activeObjectUrl = null;
    }
    const detail = panel.querySelector(".czp-detail-pane");
    detail.innerHTML = `
      <div class="czp-detail-header">
        <div class="czp-detail-title"><span>${entryIcon(entry)}</span><div><h3>${escapeHtml(entry.basename || entry.name)}</h3><p>${escapeHtml(entry.name)}</p></div></div>
        <div class="czp-meta-grid">
          ${metaItem("Type", entry.isDirectory ? "Folder" : fileKind(entry.name))}
          ${metaItem("Expanded", entry.isDirectory ? "—" : formatBytes(entry.uncompressedSize))}
          ${metaItem("Compressed", entry.isDirectory ? "—" : formatBytes(entry.compressedSize))}
          ${metaItem("Method", entry.methodLabel)}
          ${metaItem("Modified", entry.modified ? entry.modified.toLocaleString() : "Unknown")}
          ${metaItem("CRC-32", entry.isDirectory ? "—" : entry.crcHex)}
        </div>
        <div class="czp-safety ${entry.pathSafety.safe ? "safe" : "unsafe"}">${entry.pathSafety.safe ? checkIcon() : warningIcon()}<span>${entry.pathSafety.label}${entry.encrypted ? " · Encrypted" : ""}</span></div>
      </div>
      <div class="czp-preview-area"><div class="czp-preview-placeholder">${entry.isDirectory ? "Folder entries do not have file contents." : "Loading preview…"}</div></div>`;
    if (entry.isDirectory) return;

    const preview = detail.querySelector(".czp-preview-area");
    try {
      const extension = getExtension(entry.name);
      if (IMAGE_TYPES.has(extension)) {
        const bytes = await archive.extract(entry, MAX_IMAGE_PREVIEW);
        if (panel !== activePanel) return;
        const blob = new Blob([bytes], { type: IMAGE_TYPES.get(extension) });
        activeObjectUrl = URL.createObjectURL(blob);
        preview.innerHTML = `
          <div class="czp-image-tools">
            <span class="czp-image-dimensions">Loading image…</span>
            <div class="czp-zoom-controls" role="group" aria-label="Image zoom controls">
              <button type="button" data-zoom="out" aria-label="Zoom out">${minusIcon()}</button>
              <button type="button" data-zoom="fit" class="is-active">Fit</button>
              <button type="button" data-zoom="in" aria-label="Zoom in">${plusIcon()}</button>
            </div>
          </div>
          <div class="czp-image-viewport"><img alt="Preview of ${escapeHtml(entry.basename)}"></div>
          <div class="czp-image-caption"><span>${escapeHtml(entry.basename)} · ${formatBytes(bytes.length)}</span><span class="czp-zoom-label">Fit to window</span></div>`;
        const image = preview.querySelector("img");
        const viewport = preview.querySelector(".czp-image-viewport");
        const fitButton = preview.querySelector('[data-zoom="fit"]');
        const zoomLabel = preview.querySelector(".czp-zoom-label");
        let fitImage = true;
        let zoom = 1;

        const applyImageZoom = () => {
          fitButton.classList.toggle("is-active", fitImage);
          if (fitImage) {
            image.style.removeProperty("width");
            image.style.removeProperty("max-width");
            image.style.removeProperty("max-height");
            zoomLabel.textContent = "Fit to window";
          } else {
            image.style.width = `${Math.max(1, Math.round(image.naturalWidth * zoom))}px`;
            image.style.maxWidth = "none";
            image.style.maxHeight = "none";
            zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
          }
        };
        preview.querySelector('[data-zoom="out"]').addEventListener("click", () => {
          if (fitImage) { fitImage = false; zoom = 0.75; }
          else zoom = Math.max(0.25, zoom - 0.25);
          applyImageZoom();
        });
        fitButton.addEventListener("click", () => {
          fitImage = true;
          applyImageZoom();
        });
        preview.querySelector('[data-zoom="in"]').addEventListener("click", () => {
          if (fitImage) { fitImage = false; zoom = 1; }
          else zoom = Math.min(4, zoom + 0.25);
          applyImageZoom();
        });
        image.addEventListener("load", () => {
          preview.querySelector(".czp-image-dimensions").textContent = `${image.naturalWidth.toLocaleString()} × ${image.naturalHeight.toLocaleString()} px`;
          applyImageZoom();
        }, { once: true });
        image.addEventListener("dblclick", () => {
          fitImage = !fitImage;
          zoom = 1;
          applyImageZoom();
          if (!fitImage) viewport.scrollTo({ left: 0, top: 0 });
        });
        image.src = activeObjectUrl;
      } else if (isTextFile(entry.name)) {
        const bytes = await archive.extract(entry, MAX_TEXT_PREVIEW);
        if (panel !== activePanel) return;
        const decoded = decodeText(bytes);
        preview.innerHTML = `<div class="czp-code-toolbar"><span>${escapeHtml(decoded.encoding)}</span><span>${decoded.lines.toLocaleString()} lines</span></div><pre class="czp-text-preview"></pre>`;
        preview.querySelector("pre").textContent = decoded.text;
      } else {
        const bytes = await archive.extract(entry, Math.min(MAX_TEXT_PREVIEW, Math.max(entry.uncompressedSize, 1)));
        if (panel !== activePanel) return;
        preview.innerHTML = `<div class="czp-binary-intro"><strong>Binary preview</strong><span>First ${Math.min(bytes.length, 1024).toLocaleString()} bytes shown as hex and text.</span></div><pre class="czp-hex-preview"></pre>`;
        preview.querySelector("pre").textContent = hexDump(bytes.subarray(0, 1024));
      }
    } catch (error) {
      if (panel !== activePanel) return;
      preview.innerHTML = `<div class="czp-preview-error">${warningIcon()}<strong>Preview unavailable</strong><span>${escapeHtml(error?.message || "This file cannot be previewed.")}</span></div>`;
    }
  }

  function renderError(panel, message) {
    if (panel !== activePanel) return;
    panel.querySelector(".czp-body").innerHTML = `
      <div class="czp-fatal">
        <div>${warningIcon()}</div><h3>Couldn’t open this ZIP</h3><p>${escapeHtml(message)}</p>
        <button type="button">Close preview</button>
      </div>`;
    panel.querySelector(".czp-fatal button").addEventListener("click", closePanel);
  }

  function closePanel() {
    if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);
    activeObjectUrl = null;
    activePanel?.remove();
    activePanel = null;
    activeAttachment = null;
  }

  function joinChunks(chunks, length) {
    const result = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return result;
  }

  function base64ToBytes(value) {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  function decodeText(bytes) {
    let encoding = "UTF-8";
    let view = bytes;
    if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) view = bytes.subarray(3);
    else if (bytes[0] === 0xff && bytes[1] === 0xfe) { encoding = "UTF-16 LE"; view = bytes.subarray(2); }
    else if (bytes[0] === 0xfe && bytes[1] === 0xff) { encoding = "UTF-16 BE"; view = bytes.subarray(2); }
    const text = new TextDecoder(encoding.toLowerCase().replace(" ", "-"), { fatal: false }).decode(view);
    return { text, encoding, lines: text.length ? text.split(/\r\n|\r|\n/).length : 0 };
  }

  function hexDump(bytes) {
    const rows = [];
    for (let offset = 0; offset < bytes.length; offset += 16) {
      const chunk = bytes.subarray(offset, offset + 16);
      const hex = Array.from(chunk, (value) => value.toString(16).padStart(2, "0")).join(" ").padEnd(47, " ");
      const ascii = Array.from(chunk, (value) => value >= 32 && value <= 126 ? String.fromCharCode(value) : ".").join("");
      rows.push(`${offset.toString(16).padStart(8, "0")}  ${hex}  |${ascii}|`);
    }
    return rows.join("\n");
  }

  function isTextFile(name) {
    const extension = getExtension(name);
    const basename = name.split("/").pop()?.toLocaleLowerCase() || "";
    return TEXT_EXTENSIONS.has(extension) || TEXT_EXTENSIONS.has(basename) || /^(readme|license|makefile|dockerfile)(\..*)?$/i.test(basename);
  }

  function getExtension(name) {
    const basename = name.split("/").pop() || "";
    const dot = basename.lastIndexOf(".");
    return dot > 0 ? basename.slice(dot + 1).toLocaleLowerCase() : basename.toLocaleLowerCase();
  }

  function fileKind(name) {
    const extension = getExtension(name);
    if (IMAGE_TYPES.has(extension)) return `${extension.toUpperCase()} image`;
    if (isTextFile(name)) return extension ? `${extension.toUpperCase()} text` : "Text file";
    return extension ? `${extension.toUpperCase()} file` : "File";
  }

  function parentPath(name) {
    const clean = name.replace(/\/$/, "");
    const slash = clean.lastIndexOf("/");
    return slash >= 0 ? clean.slice(0, slash + 1) : "Archive root";
  }

  function statCard(label, value) { return `<div class="czp-stat"><span>${label}</span><strong>${value}</strong></div>`; }
  function metaItem(label, value) { return `<div><span>${label}</span><strong title="${escapeHtml(String(value))}">${escapeHtml(String(value))}</strong></div>`; }

  function makeNotice(type, text) {
    const node = document.createElement("div");
    node.className = `czp-notice ${type}`;
    node.innerHTML = `${type === "danger" || type === "warning" ? warningIcon() : infoIcon()}<span></span>`;
    node.querySelector("span").textContent = text;
    return node;
  }

  function entryIcon(entry) {
    if (entry.isDirectory) return folderIcon();
    const extension = getExtension(entry.name);
    if (IMAGE_TYPES.has(extension)) return imageIcon();
    if (isTextFile(entry.name)) return codeIcon();
    return documentIcon();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }

  const icon = (body, viewBox = "0 0 24 24") => `<svg viewBox="${viewBox}" aria-hidden="true" focusable="false">${body}</svg>`;
  function zipIcon() { return icon('<path d="M7 3.5h6l4 4V20a.5.5 0 0 1-.5.5h-9A.5.5 0 0 1 7 20V3.5Z"/><path d="M13 3.5v4h4M10 5.5h2M10 8.5h2M10 11.5h2M9.75 14.5h2.5v3h-2.5z"/>'); }
  function closeIcon() { return icon('<path d="m6 6 12 12M18 6 6 18"/>'); }
  function searchIcon() { return icon('<circle cx="10.5" cy="10.5" r="5.75"/><path d="m15 15 4.25 4.25"/>'); }
  function copyIcon() { return icon('<rect x="8" y="8" width="10" height="11" rx="1.5"/><path d="M15 8V6.5A1.5 1.5 0 0 0 13.5 5h-7A1.5 1.5 0 0 0 5 6.5v8A1.5 1.5 0 0 0 6.5 16H8"/>'); }
  function minusIcon() { return icon('<path d="M6 12h12"/>'); }
  function plusIcon() { return icon('<path d="M6 12h12M12 6v12"/>'); }
  function folderIcon() { return icon('<path d="M3.5 7.5h6l1.75 2H20.5v8.75a1.25 1.25 0 0 1-1.25 1.25H4.75a1.25 1.25 0 0 1-1.25-1.25V7.5Z"/><path d="M3.5 7.5V5.75A1.25 1.25 0 0 1 4.75 4.5H9l1.75 2H19a1.5 1.5 0 0 1 1.5 1.5v1.5"/>'); }
  function documentIcon() { return icon('<path d="M6.5 3.5h7l4 4v13h-11v-17Z"/><path d="M13.5 3.5v4h4M9 12h6M9 15h6M9 18h4"/>'); }
  function codeIcon() { return icon('<path d="M6.5 3.5h7l4 4v13h-11v-17Z"/><path d="M13.5 3.5v4h4M10.5 12l-2 2 2 2M13.5 12l2 2-2 2"/>'); }
  function imageIcon() { return icon('<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><circle cx="9" cy="9.5" r="1.5"/><path d="m5.5 17 4.25-4.25 2.75 2.75 2-2 4 3.5"/>'); }
  function warningIcon() { return icon('<path d="m12 3 9 16H3l9-16Z"/><path d="M12 9v4.5M12 16.5h.01"/>'); }
  function infoIcon() { return icon('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>'); }
  function checkIcon() { return icon('<circle cx="12" cy="12" r="9"/><path d="m8 12 2.75 2.75L16.5 9"/>'); }
})();
