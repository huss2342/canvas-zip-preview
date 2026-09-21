// Fetches with extension host permissions as a fallback for Canvas download URLs
// that redirect to cross-origin object storage. A Port keeps this service worker
// alive while bytes are streamed to the SpeedGrader tab.
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "canvas-zip-fetch") return;

  const controller = new AbortController();
  let started = false;

  port.onDisconnect.addListener(() => controller.abort());
  port.onMessage.addListener(async (message) => {
    if (started || message?.type !== "fetch" || typeof message.url !== "string") return;
    started = true;

    try {
      const url = new URL(message.url);
      if (url.protocol !== "https:") throw new Error("Only secure HTTPS downloads are allowed.");

      const response = await fetch(url.href, {
        credentials: "include",
        redirect: "follow",
        signal: controller.signal
      });

      if (!response.ok) throw new Error(`Canvas returned HTTP ${response.status}.`);
      const contentLength = Number(response.headers.get("content-length")) || 0;
      port.postMessage({ type: "start", total: contentLength });

      if (!response.body) {
        const bytes = new Uint8Array(await response.arrayBuffer());
        port.postMessage({ type: "chunk", data: bytesToBase64(bytes), loaded: bytes.length });
        port.postMessage({ type: "done", total: bytes.length });
        return;
      }

      const reader = response.body.getReader();
      let loaded = 0;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        loaded += value.byteLength;
        port.postMessage({ type: "chunk", data: bytesToBase64(value), loaded });
      }
      port.postMessage({ type: "done", total: loaded });
    } catch (error) {
      if (!controller.signal.aborted) {
        port.postMessage({ type: "error", message: error?.message || "The ZIP could not be downloaded." });
      }
    }
  });
});

function bytesToBase64(bytes) {
  let binary = "";
  const blockSize = 0x8000;
  for (let index = 0; index < bytes.length; index += blockSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + blockSize));
  }
  return btoa(binary);
}
