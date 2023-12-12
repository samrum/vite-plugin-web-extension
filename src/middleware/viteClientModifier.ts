import getEtag from "etag";
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

function addCustomStyleFunctionality(source: string): string {
  if (
    !/const sheetsMap/.test(source) ||
    !/document\.head\.appendChild\(style\)/.test(source) ||
    !/document\.head\.removeChild\(style\)/.test(source) ||
    (!/style\.textContent = content/.test(source) &&
      !/style\.innerHTML = content/.test(source))
  ) {
    console.error(
      "Web extension HMR style support disabled -- failed to update vite client"
    );

    return source;
  }

  source = source.replace(
    "const sheetsMap",
    "const styleTargets = new Set(); const styleTargetsStyleMap = new Map(); const sheetsMap"
  );
  source = source.replace("export {", "export { addStyleTarget, ");
  source = source.replace(
    "document.head.appendChild(style)",
    "styleTargets.size ? styleTargets.forEach(target => addStyleToTarget(style, target)) : document.head.appendChild(style)"
  );
  source = source.replace(
    "document.head.removeChild(style)",
    "styleTargetsStyleMap.get(style) ? styleTargetsStyleMap.get(style).forEach(style => style.parentNode.removeChild(style)) : document.head.removeChild(style)"
  );

  const styleProperty = /style\.textContent = content/.test(source)
    ? "style.textContent"
    : "style.innerHTML";

  const lastStyleInnerHtml = source.lastIndexOf(`${styleProperty} = content`);

  source =
    source.slice(0, lastStyleInnerHtml) +
    source
      .slice(lastStyleInnerHtml)
      .replace(
        `${styleProperty} = content`,
        `${styleProperty} = content; styleTargetsStyleMap.get(style)?.forEach(style => ${styleProperty} = content)`
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

function guardDocumentUsageWithDefault(
  source: string,
  documentUsage: string,
  defaultValue: string
): string {
  return source.replace(
    documentUsage,
    `('document' in globalThis ? ${documentUsage} : ${defaultValue})`
  );
}

function addServiceWorkerSupport(source: string): string {
  // update location.reload usages
  source = source.replaceAll(
    /(window\.)?location.reload\(\)/g,
    "(location.reload?.() ?? (typeof chrome !== 'undefined' ? chrome.runtime?.reload?.() : ''))"
  );

  // add document guards
  source = guardDocumentUsageWithDefault(
    source,
    "document.querySelectorAll(overlayId).length",
    "false"
  );

  source = guardDocumentUsageWithDefault(
    source,
    "document.visibilityState",
    `"visible"`
  );

  source = guardDocumentUsageWithDefault(
    source,
    `document.querySelectorAll('link')`,
    "[]"
  );

  source = source.replace(
    "const enableOverlay =",
    `const enableOverlay = ('document' in globalThis) &&`
  );

  return source;
}

export default viteClientModifier;
