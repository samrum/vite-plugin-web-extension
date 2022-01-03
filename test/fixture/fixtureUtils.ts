export function getExpectedHtml(asset: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    

    <script type="module" src="http://example.com/httpModuleScript.js"></script>
    <script type="module" crossorigin src="/assets/${asset}.js"></script>
  </head>
</html>
`;
}

export function getExpectedHtmlLoader(asset: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" />  <script type="module" crossorigin src="/assets/${asset}.js"></script>
</head></html>`;
}

export function getExpectedContentLoaderHtml(scriptFileName: string): string {
  return `(async()=>{await import(chrome.runtime.getURL("${scriptFileName}"))})();`;
}

export function getExpectedLog(message: string): string {
  return `function log(message) {
  console.log(message);
}
log("${message}");
`;
}

export function getExpectedLogChunk(): string {
  return `function log(message) {
  console.log(message);
}
export { log as l };
`;
}

export function getExpectedLogFromChunk(message: string): string {
  return `import { l as log } from "../../../../../../log.js";
log("${message}");
`;
}

export function getExpectedLogDynamicChunk(): string {
  return `function log(message) {
  console.log(message);
}
export { log as default };
`;
}

export function getExpectedLogFromDynamicChunk(message: string): string {
  return `import { _ as __vitePreload } from "../../../../../../preload-helper.js";
(async () => {
  const log = await __vitePreload(() => import("../../../../../../log.js"), true ? [] : void 0);
  log("${message}");
})();
`;
}

export function getPreloadHelper(): string {
  return `null`;
}
