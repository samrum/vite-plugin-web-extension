import getEtag from "etag";
import { version as viteVersion } from "vite";
import type { Connect } from "vite";

// Modifies the vite HMR client to support various web extension features including:
//  Exporting a function to add HMR style injection targets
//  Tweaks to support running in a service worker context
const viteClientModifier: Connect.NextHandleFunction = (req, res, next) => {
  const _originalEnd = res.end;

  // @ts-ignore
  res.end = function end(chunk, ...otherArgs) {
    if (req.url === "/@vite/client" && typeof chunk === "string") {
      chunk = addCustomStyleFunctionality(chunk);
      chunk = addServiceWorkerSupport(chunk);

      res.setHeader("Etag", getEtag(chunk, { weak: true }));
    }

    // @ts-ignore
    return _originalEnd.call(this, chunk, ...otherArgs);
  };

  next();
};

function logFailedClientUpdate(feature: string): void {
  console.error(
    `Web extension ${feature} support disabled -- failed to patch the vite client (vite ${viteVersion}). Please file an issue at https://github.com/samrum/vite-plugin-web-extension/issues`
  );
}

export function addCustomStyleFunctionality(source: string): string {
  if (
    !/const sheetsMap/.test(source) ||
    !/export \{/.test(source) ||
    !/if \(!lastInsertedStyle\) \{/.test(source) ||
    !/document\.head\.appendChild\(style\)/.test(source) ||
    !/document\.head\.removeChild\(style\)/.test(source) ||
    !/style\.textContent = content/.test(source)
  ) {
    logFailedClientUpdate("HMR style");

    return source;
  }

  source = source.replace(
    "const sheetsMap",
    "const styleTargets = new Set(); const styleTargetsStyleMap = new Map(); const sheetsMap"
  );
  source = source.replace("export {", "export { addStyleTarget, ");

  // When style targets are registered, always take the (patched) appendChild
  //   branch instead of inserting relative to a style element that was never
  //   added to the page document
  source = source.replace(
    "if (!lastInsertedStyle) {",
    "if (styleTargets.size || !lastInsertedStyle) {"
  );
  source = source.replace(
    "document.head.appendChild(style)",
    "styleTargets.size ? styleTargets.forEach(target => addStyleToTarget(style, target)) : document.head.appendChild(style)"
  );
  source = source.replace(
    "document.head.removeChild(style)",
    "styleTargetsStyleMap.get(style) ? styleTargetsStyleMap.get(style).forEach(style => style.parentNode.removeChild(style)) : document.head.removeChild(style)"
  );

  // The last `style.textContent = content` is the existing style update branch
  const lastStyleUpdate = source.lastIndexOf("style.textContent = content");

  source =
    source.slice(0, lastStyleUpdate) +
    source
      .slice(lastStyleUpdate)
      .replace(
        "style.textContent = content",
        "style.textContent = content; styleTargetsStyleMap.get(style)?.forEach(style => style.textContent = content)"
      );

  source += `
    function addStyleTarget(newStyleTarget) {
      for (const [, style] of sheetsMap.entries()) {
        addStyleToTarget(style, newStyleTarget, styleTargets.size !== 0);
      }

      styleTargets.add(newStyleTarget);
    }

    function addStyleToTarget(style, target, cloneStyle = true) {
      const addedStyle = cloneStyle ? style.cloneNode(true) : style;
      target.appendChild(addedStyle);

      styleTargetsStyleMap.set(style, [...(styleTargetsStyleMap.get(style) ?? []), addedStyle]);
    }
  `;

  return source;
}

export function addServiceWorkerSupport(source: string): string {
  if (
    !/(window\.)?location\.reload\(\)/.test(source) ||
    !/if \(hasDocument\) if \(payload\.path && payload\.path\.endsWith\("\.html"\)\)/.test(
      source
    ) ||
    !/if \(hasDocument && !willUnload\)/.test(source) ||
    !/currentState: document\.visibilityState/.test(source) ||
    !/document\.addEventListener\("visibilitychange", onVisibilityChange\);/.test(
      source
    ) ||
    !/document\.querySelectorAll\("link"\)/.test(source)
  ) {
    logFailedClientUpdate("service worker HMR");

    return source;
  }

  // update location.reload usages to fall back to a full extension reload
  source = source.replaceAll(
    /(window\.)?location\.reload\(\)/g,
    "(location.reload?.() ?? (typeof chrome !== 'undefined' ? chrome.runtime?.reload?.() : ''))"
  );

  // reload on full-reload payloads even when there is no document (service workers)
  source = source.replace(
    'if (hasDocument) if (payload.path && payload.path.endsWith(".html"))',
    'if (!hasDocument) pageReload(); else if (payload.path && payload.path.endsWith(".html"))'
  );

  // poll for a server restart and reload even when there is no document
  source = source.replace(
    "if (hasDocument && !willUnload)",
    "if (!willUnload)"
  );
  source = source.replace(
    "currentState: document.visibilityState",
    `currentState: "document" in globalThis ? document.visibilityState : "visible"`
  );
  source = source.replaceAll(
    'document.addEventListener("visibilitychange", onVisibilityChange);',
    'if ("document" in globalThis) document.addEventListener("visibilitychange", onVisibilityChange);'
  );

  // add document guards
  source = source.replace(
    'document.querySelectorAll("link")',
    '("document" in globalThis ? document.querySelectorAll("link") : [])'
  );

  return source;
}

export default viteClientModifier;
