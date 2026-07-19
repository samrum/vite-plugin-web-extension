import getEtag from "etag";
import type { Connect } from "vite";
import type { ServerResponse } from "node:http";

export const VITE_CLIENT_URL = "/@vite/client";

// The unmodified vite client is served here so the wrapper served at
//   /@vite/client can delegate to it
export const ORIGINAL_VITE_CLIENT_URL = "/@web-extension/vite-client";

export const SERVICE_WORKER_CLIENT_URL =
  "/@web-extension/service-worker-client";

// Served in place of the vite client. Re-exports the original client while
//   wrapping its exported style functions to support additional style targets
//   (e.g. shadow roots in content scripts). Style updates flow through these
//   exports because vite's dev CSS modules import updateStyle / removeStyle
//   from /@vite/client.
export function getViteClientWrapperSource(): string {
  return `
import {
  updateStyle as __viteUpdateStyle,
  removeStyle as __viteRemoveStyle,
} from "${ORIGINAL_VITE_CLIENT_URL}";
export * from "${ORIGINAL_VITE_CLIENT_URL}";

const styleTargets = new Set();

// id -> { content, inOriginalClient, targetElements: Map<target, element> }
const styles = new Map();

function getStyleRecord(id) {
  let record = styles.get(id);

  if (!record) {
    record = {
      content: "",
      inOriginalClient: false,
      targetElements: new Map(),
    };
    styles.set(id, record);
  }

  return record;
}

function setStyleForTarget(record, id, target) {
  let element = record.targetElements.get(target);

  if (!element) {
    element = document.createElement("style");
    element.setAttribute("type", "text/css");
    element.setAttribute("data-vite-dev-id", id);
    target.appendChild(element);
    record.targetElements.set(target, element);
  }

  element.textContent = record.content;
}

export function updateStyle(id, content) {
  const record = getStyleRecord(id);
  record.content = content;

  if (styleTargets.size === 0) {
    __viteUpdateStyle(id, content);
    record.inOriginalClient = true;
    return;
  }

  for (const target of styleTargets) {
    setStyleForTarget(record, id, target);
  }
}

export function removeStyle(id) {
  const record = styles.get(id);

  if (!record) {
    __viteRemoveStyle(id);
    return;
  }

  if (record.inOriginalClient) {
    __viteRemoveStyle(id);
  }

  for (const element of record.targetElements.values()) {
    element.remove();
  }

  styles.delete(id);
}

export function addStyleTarget(target) {
  for (const [id, record] of styles) {
    if (record.inOriginalClient) {
      __viteRemoveStyle(id);
      record.inOriginalClient = false;
    }

    setStyleForTarget(record, id, target);
  }

  styleTargets.add(target);
}
`;
}

// A minimal HMR client for the background service worker. The vite client
//   itself is service worker safe to import in vite 8 (all document / window
//   usage is guarded), but its reload handling is document-gated, so this
//   module reloads the extension instead.
export function getServiceWorkerClientSource(): string {
  return `
import { createHotContext } from "${ORIGINAL_VITE_CLIENT_URL}";

const hot = createHotContext("${SERVICE_WORKER_CLIENT_URL}");

function reloadExtension() {
  if (typeof chrome !== "undefined") {
    chrome.runtime?.reload?.();
  }
}

hot.on("vite:beforeFullReload", () => {
  reloadExtension();
});

// On dev server restart, wait for the server to come back before reloading
//   so the reloaded service worker can load from it
hot.on("vite:ws:disconnect", async () => {
  const origin = new URL(import.meta.url).origin;

  while (true) {
    try {
      await fetch(origin, { headers: { Accept: "text/x-vite-ping" } });
      break;
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  reloadExtension();
});
`;
}

function serveModuleSource(
  req: Connect.IncomingMessage,
  res: ServerResponse,
  source: string
): void {
  const etag = getEtag(source, { weak: true });

  if (req.headers["if-none-match"] === etag) {
    res.statusCode = 304;
    res.end();
    return;
  }

  res.setHeader("Content-Type", "text/javascript");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Etag", etag);
  res.end(source);
}

const devClientMiddleware: Connect.NextHandleFunction = (req, res, next) => {
  const [url, query] = (req.url ?? "").split("?");

  switch (url) {
    case VITE_CLIENT_URL:
      serveModuleSource(req, res, getViteClientWrapperSource());
      return;
    case SERVICE_WORKER_CLIENT_URL:
      serveModuleSource(req, res, getServiceWorkerClientSource());
      return;
    case ORIGINAL_VITE_CLIENT_URL:
      // let vite serve the real client at its own url
      req.url = `${VITE_CLIENT_URL}${query ? `?${query}` : ""}`;
      break;
  }

  next();
};

export default devClientMiddleware;
