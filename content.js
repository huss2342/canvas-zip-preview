(function canvasZipPreview() {
  "use strict";

  const { ZipArchive, formatBytes } = globalThis.CanvasZipReader;
  const MAX_ARCHIVE_BYTES = 250 * 1024 * 1024;
  const MAX_TEXT_PREVIEW = 2 * 1024 * 1024;
  const MAX_IMAGE_PREVIEW = 12 * 1024 * 1024;
  const WINDOW_SIZE_KEY = "preferredPreviewWindowSize";
  const WINDOW_DIMENSIONS_KEY = "preferredPreviewWindowDimensions";
  const WINDOW_SIZES = new Set(["normal", "large", "full", "custom"]);
  const ZOOM_STEPS = [0.05, 0.1, 0.125, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
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
  let activeDownloadController = null;
  let activeImageCleanup = null;
  let activeTrigger = null;
  let previewGeneration = 0;
  let panelGeneration = 0;
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
      button.addEventListener("click", () => openArchive(download.href, fileName, item, button));

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

  async function openArchive(url, fileName, attachment, trigger) {
    closePanel(false);
    const generation = panelGeneration;
    activeAttachment = attachment;
    activeTrigger = trigger;
    const windowPreference = await getWindowPreference();
    if (generation !== panelGeneration || !attachment.isConnected) return;
    const panel = createPanel(fileName, windowPreference);
    activePanel = panel;
    document.body.append(panel);
    if (panel.dataset.size === "custom") applyPanelDimensions(panel, windowPreference.dimensions);
    panel.querySelector(".czp-close").focus();
    const controller = new AbortController();
    activeDownloadController = controller;

    try {
      setLoading(panel, "Downloading securely from Canvas…", 0);
      const buffer = await downloadArchive(url, (loaded, total) => {
        const percent = total ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
        setLoading(panel, total ? `Downloading ${formatBytes(loaded)} of ${formatBytes(total)}…` : `Downloading ${formatBytes(loaded)}…`, percent);
      }, controller.signal);
      if (buffer.byteLength > MAX_ARCHIVE_BYTES) {
        throw new Error(`This archive is ${formatBytes(buffer.byteLength)}. The in-browser limit is ${formatBytes(MAX_ARCHIVE_BYTES)}.`);
      }
      setLoading(panel, "Reading ZIP directory…", 100);
      const archive = new ZipArchive(buffer);
      renderArchive(panel, archive, fileName, buffer.byteLength);
    } catch (error) {
      renderError(panel, error?.message || "The ZIP could not be opened.");
    } finally {
      if (activeDownloadController === controller) activeDownloadController = null;
    }
  }

  async function downloadArchive(url, onProgress, signal) {
    try {
      const response = await fetch(url, { credentials: "include", redirect: "follow", signal });
      if (!response.ok) throw new Error(`Canvas returned HTTP ${response.status}.`);
      return await readResponse(response, onProgress);
    } catch (pageFetchError) {
      if (signal.aborted) throw pageFetchError;
      try {
        return await backgroundFetch(url, onProgress, signal);
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

  function backgroundFetch(url, onProgress, signal) {
    return new Promise((resolve, reject) => {
      const port = chrome.runtime.connect({ name: "canvas-zip-fetch" });
      const chunks = [];
      let total = 0;
      let expected = 0;
      let settled = false;
      const onAbort = () => fail("Download cancelled.");
      const fail = (message) => {
        if (settled) return;
        settled = true;
        signal.removeEventListener("abort", onAbort);
        port.disconnect();
        reject(new Error(message));
      };
      signal.addEventListener("abort", onAbort, { once: true });
      if (signal.aborted) { onAbort(); return; }
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
          signal.removeEventListener("abort", onAbort);
          port.disconnect();
          resolve(joinChunks(chunks, total).buffer);
        } else if (message.type === "error") {
          fail(message.message || "The background download failed.");
        }
      });
      port.postMessage({ type: "fetch", url });
    });
  }

  function createPanel(fileName, windowPreference) {
    const panel = document.createElement("section");
    panel.className = "czp-panel";
    panel.dataset.size = windowPreference.size;
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
              <option value="normal"${panel.dataset.size === "normal" ? " selected" : ""}>Normal</option>
              <option value="large"${panel.dataset.size === "large" ? " selected" : ""}>Large</option>
              <option value="full"${panel.dataset.size === "full" ? " selected" : ""}>Full screen</option>
              <option value="custom"${panel.dataset.size === "custom" ? " selected" : ""}>Custom</option>
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
      </div>
      <button class="czp-resize-handle" type="button" aria-label="Resize preview window. Drag or use arrow keys." title="Drag to resize · Arrow keys also work"></button>`;
    panel.querySelector(".czp-close").addEventListener("click", closePanel);
    const sizeSelect = panel.querySelector(".czp-window-size select");
    const resizeHandle = panel.querySelector(".czp-resize-handle");
    let customDimensions = windowPreference.dimensions;
    const savePreference = () => {
      chrome.storage.local.set({
        [WINDOW_SIZE_KEY]: panel.dataset.size,
        [WINDOW_DIMENSIONS_KEY]: customDimensions
      }).catch(() => {
        // The current window remains usable if extension storage is unavailable.
      });
    };
    const setCustomSize = (dimensions, persist = false) => {
      panel.dataset.size = "custom";
      sizeSelect.value = "custom";
      customDimensions = applyPanelDimensions(panel, dimensions);
      if (persist) savePreference();
    };
    sizeSelect.addEventListener("change", (event) => {
      if (event.currentTarget.value === "custom") {
        const rect = panel.getBoundingClientRect();
        setCustomSize(customDimensions || { width: rect.width, height: rect.height }, true);
        return;
      }
      panel.style.removeProperty("width");
      panel.style.removeProperty("height");
      panel.dataset.size = event.currentTarget.value;
      savePreference();
    });
    let dragStart = null;
    resizeHandle.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      resizeHandle.focus();
      const rect = panel.getBoundingClientRect();
      dragStart = { x: event.clientX, y: event.clientY, width: rect.width, height: rect.height };
      resizeHandle.setPointerCapture(event.pointerId);
    });
    resizeHandle.addEventListener("pointermove", (event) => {
      if (!dragStart) return;
      setCustomSize({
        width: dragStart.width + event.clientX - dragStart.x,
        height: dragStart.height + event.clientY - dragStart.y
      });
    });
    const endResize = () => {
      if (!dragStart) return;
      dragStart = null;
      savePreference();
    };
    resizeHandle.addEventListener("pointerup", endResize);
    resizeHandle.addEventListener("pointercancel", endResize);
    resizeHandle.addEventListener("keydown", (event) => {
      const delta = { ArrowRight: [24, 0], ArrowLeft: [-24, 0], ArrowDown: [0, 24], ArrowUp: [0, -24] }[event.key];
      if (!delta) return;
      event.preventDefault();
      const rect = panel.getBoundingClientRect();
      setCustomSize({ width: rect.width + delta[0], height: rect.height + delta[1] }, true);
    });
    const handleViewportResize = () => {
      if (panel.dataset.size === "custom") applyPanelDimensions(panel, customDimensions);
    };
    window.addEventListener("resize", handleViewportResize);
    panel._cleanup = () => window.removeEventListener("resize", handleViewportResize);
    panel.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closePanel();
    });
    return panel;
  }

  function applyPanelDimensions(panel, dimensions) {
    const rect = panel.getBoundingClientRect();
    const maxWidth = Math.max(1, window.innerWidth - rect.left - (window.innerWidth <= 900 ? 12 : 20));
    const maxHeight = Math.max(1, window.innerHeight - rect.top - 12);
    const minWidth = Math.min(window.innerWidth <= 900 ? 340 : 600, maxWidth);
    const minHeight = Math.min(window.innerWidth <= 900 ? 340 : 420, maxHeight);
    const width = Math.round(Math.min(maxWidth, Math.max(minWidth, dimensions?.width || rect.width)));
    const height = Math.round(Math.min(maxHeight, Math.max(minHeight, dimensions?.height || rect.height)));
    panel.style.width = `${width}px`;
    panel.style.height = `${height}px`;
    return { width, height };
  }

  async function getWindowPreference() {
    try {
      const stored = await chrome.storage.local.get([WINDOW_SIZE_KEY, WINDOW_DIMENSIONS_KEY]);
      const saved = stored[WINDOW_DIMENSIONS_KEY];
      return {
        size: WINDOW_SIZES.has(stored[WINDOW_SIZE_KEY]) ? stored[WINDOW_SIZE_KEY] : "normal",
        dimensions: Number.isFinite(saved?.width) && Number.isFinite(saved?.height) ? saved : null
      };
    } catch {
      return { size: "normal", dimensions: null };
    }
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
        <button type="button" class="czp-copy" title="Copy file list">${copyIcon()}<span aria-live="polite">Copy file list</span></button>
      </div>
      <div class="czp-notices" aria-live="polite"></div>
      <div class="czp-workspace">
        <div class="czp-list-pane">
          <div class="czp-list-heading"><span>Archive contents</span><span aria-live="polite">${files.length + directories.length} entries</span></div>
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
    list.addEventListener("keydown", (event) => {
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      const visible = Array.from(list.children).filter((row) => !row.hidden);
      if (!visible.length) return;
      event.preventDefault();
      const index = visible.indexOf(event.target);
      const next = event.key === "Home" ? 0 : event.key === "End" ? visible.length - 1
        : event.key === "ArrowDown" ? Math.min(visible.length - 1, index + 1) : Math.max(0, index - 1);
      visible[next].focus();
      visible[next].click();
    });

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
      body.querySelector(".czp-list-heading span:last-child").textContent = query ? `${shown} of ${archive.entries.length} entries` : `${archive.entries.length} entries`;
      if (list.querySelector('[tabindex="0"]:not([hidden])') === null) {
        list.querySelector('[tabindex="0"]')?.setAttribute("tabindex", "-1");
        Array.from(list.children).find((row) => !row.hidden)?.setAttribute("tabindex", "0");
      }
    });

    const copyButton = body.querySelector(".czp-copy");
    copyButton.addEventListener("click", async () => {
      const text = archive.entries.map((entry) => `${entry.isDirectory ? "[folder]" : formatBytes(entry.uncompressedSize).padStart(10)}  ${entry.name}`).join("\n");
      try {
        await navigator.clipboard.writeText(text);
        copyButton.querySelector("span").textContent = "Copied!";
        copyButton.title = "Copied!";
        setTimeout(() => {
          if (!copyButton.isConnected) return;
          copyButton.querySelector("span").textContent = "Copy file list";
          copyButton.title = "Copy file list";
        }, 1500);
      } catch {
        copyButton.querySelector("span").textContent = "Copy failed";
        copyButton.title = "Copy failed";
        setTimeout(() => {
          if (!copyButton.isConnected) return;
          copyButton.querySelector("span").textContent = "Copy file list";
          copyButton.title = "Copy file list";
        }, 2000);
      }
    });
  }

  function renderEntryList(list, entries, archive, panel) {
    const fragment = document.createDocumentFragment();
    entries.forEach((entry, index) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = `czp-file-row${entry.isDirectory ? " is-directory" : ""}${entry.pathSafety.safe ? "" : " is-unsafe"}`;
      row.setAttribute("role", "option");
      row.setAttribute("aria-selected", "false");
      row.tabIndex = index === 0 ? 0 : -1;
      row.dataset.name = entry.name.toLocaleLowerCase();
      row.style.setProperty("--depth", Math.min(entry.depth, 8));
      row.innerHTML = `
        <span class="czp-file-icon">${entryIcon(entry)}</span>
        <span class="czp-file-main"><span class="czp-file-name" title="${escapeHtml(entry.name)}">${escapeHtml(entry.basename || entry.name)}</span><span class="czp-file-path">${escapeHtml(parentPath(entry.name))}</span></span>
        <span class="czp-file-size">${entry.isDirectory ? "folder" : formatBytes(entry.uncompressedSize)}</span>`;
      row.addEventListener("click", () => {
        list.querySelector('[aria-selected="true"]')?.setAttribute("aria-selected", "false");
        list.querySelector('[tabindex="0"]')?.setAttribute("tabindex", "-1");
        row.tabIndex = 0;
        row.setAttribute("aria-selected", "true");
        showEntry(panel, archive, entry);
      });
      fragment.append(row);
    });
    list.append(fragment);
  }

  async function showEntry(panel, archive, entry) {
    const generation = ++previewGeneration;
    activeImageCleanup?.();
    activeImageCleanup = null;
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
        if (panel !== activePanel || generation !== previewGeneration) return;
        const blob = new Blob([bytes], { type: IMAGE_TYPES.get(extension) });
        activeObjectUrl = URL.createObjectURL(blob);
        preview.innerHTML = `
          <div class="czp-image-tools">
            <span class="czp-image-dimensions">Loading image…</span>
            <div class="czp-zoom-controls" role="group" aria-label="Image zoom controls">
              <button type="button" data-zoom="out" aria-label="Zoom out" disabled>${minusIcon()}</button>
              <button type="button" data-zoom="fit" class="is-active">Fit</button>
              <button type="button" data-zoom="in" aria-label="Zoom in" disabled>${plusIcon()}</button>
            </div>
          </div>
          <div class="czp-image-viewport"><div class="czp-image-stage"><img alt="Preview of ${escapeHtml(entry.basename)}" title="Double-click to toggle Fit and actual size"></div></div>
          <div class="czp-image-caption"><span>${escapeHtml(entry.basename)} · ${formatBytes(bytes.length)}</span><span class="czp-zoom-label">Fit to window</span></div>`;
        const image = preview.querySelector("img");
        const viewport = preview.querySelector(".czp-image-viewport");
        const fitButton = preview.querySelector('[data-zoom="fit"]');
        const outButton = preview.querySelector('[data-zoom="out"]');
        const inButton = preview.querySelector('[data-zoom="in"]');
        const zoomLabel = preview.querySelector(".czp-zoom-label");
        let fitImage = true;
        let zoom = 1;
        const fitScale = () => Math.min(
          1,
          Math.max(1, viewport.clientWidth - 16) / image.naturalWidth,
          Math.max(1, viewport.clientHeight - 16) / image.naturalHeight
        );
        const applyImageZoom = () => {
          fitButton.classList.toggle("is-active", fitImage);
          if (!image.naturalWidth || !image.naturalHeight) return;
          const scale = fitImage ? fitScale() : zoom;
          image.style.width = `${Math.max(1, Math.round(image.naturalWidth * scale))}px`;
          const percent = scale < 0.1 ? (scale * 100).toFixed(1) : Math.round(scale * 100);
          zoomLabel.textContent = fitImage ? `Fit · ${percent}%` : `${percent}%`;
          outButton.disabled = scale <= 0.0101;
          inButton.disabled = scale >= 4;
        };
        const centerImage = () => requestAnimationFrame(() => {
          if (generation !== previewGeneration) return;
          viewport.scrollTo({
            left: Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2),
            top: Math.max(0, (viewport.scrollHeight - viewport.clientHeight) / 2)
          });
        });
        const stepZoom = (direction) => {
          if (!image.naturalWidth) return;
          const current = fitImage ? fitScale() : zoom;
          if (current < ZOOM_STEPS[0]) {
            zoom = Math.max(0.01, Math.min(ZOOM_STEPS[0], current * (direction > 0 ? 1.5 : 1 / 1.5)));
          } else if (direction > 0) {
            zoom = ZOOM_STEPS.find((step) => step > current + 0.001) || ZOOM_STEPS.at(-1);
          } else {
            zoom = ZOOM_STEPS.findLast((step) => step < current - 0.001) || Math.max(0.01, current / 1.5);
          }
          fitImage = false;
          applyImageZoom();
          centerImage();
        };
        outButton.addEventListener("click", () => stepZoom(-1));
        fitButton.addEventListener("click", () => {
          fitImage = true;
          applyImageZoom();
          centerImage();
        });
        inButton.addEventListener("click", () => stepZoom(1));
        image.addEventListener("load", () => {
          if (panel !== activePanel || generation !== previewGeneration) return;
          preview.querySelector(".czp-image-dimensions").textContent = `${image.naturalWidth.toLocaleString()} × ${image.naturalHeight.toLocaleString()} px`;
          applyImageZoom();
          const observer = new ResizeObserver(() => {
            if (fitImage) applyImageZoom();
          });
          observer.observe(viewport);
          activeImageCleanup = () => observer.disconnect();
        }, { once: true });
        image.addEventListener("error", () => {
          if (panel !== activePanel || generation !== previewGeneration) return;
          preview.innerHTML = `<div class="czp-preview-error">${warningIcon()}<strong>Preview unavailable</strong><span>The browser could not display this image.</span></div>`;
        }, { once: true });
        image.addEventListener("dblclick", () => {
          if (fitImage) zoom = fitScale() >= 0.95 ? 2 : 1;
          fitImage = !fitImage;
          applyImageZoom();
          centerImage();
        });
        image.src = activeObjectUrl;
      } else if (isTextFile(entry.name)) {
        const bytes = await archive.extract(entry, MAX_TEXT_PREVIEW);
        if (panel !== activePanel || generation !== previewGeneration) return;
        const decoded = decodeText(bytes);
        preview.innerHTML = `<div class="czp-code-toolbar"><span>${escapeHtml(decoded.encoding)}</span><span>${decoded.lines.toLocaleString()} lines</span></div><pre class="czp-text-preview"></pre>`;
        preview.querySelector("pre").textContent = decoded.text;
      } else {
        const bytes = await archive.extract(entry, Math.min(MAX_TEXT_PREVIEW, Math.max(entry.uncompressedSize, 1)));
        if (panel !== activePanel || generation !== previewGeneration) return;
        preview.innerHTML = `<div class="czp-binary-intro"><strong>Binary preview</strong><span>First ${Math.min(bytes.length, 1024).toLocaleString()} bytes shown as hex and text.</span></div><pre class="czp-hex-preview"></pre>`;
        preview.querySelector("pre").textContent = hexDump(bytes.subarray(0, 1024));
      }
    } catch (error) {
      if (panel !== activePanel || generation !== previewGeneration) return;
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

  function closePanel(restoreFocus = true) {
    panelGeneration += 1;
    previewGeneration += 1;
    activeDownloadController?.abort();
    activeDownloadController = null;
    activeImageCleanup?.();
    activeImageCleanup = null;
    if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);
    activeObjectUrl = null;
    activePanel?._cleanup?.();
    activePanel?.remove();
    activePanel = null;
    activeAttachment = null;
    if (restoreFocus && activeTrigger?.isConnected) activeTrigger.focus();
    activeTrigger = null;
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
