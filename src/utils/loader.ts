import { OutputChunk } from "rollup";
import { getOutputFileName } from "./file";

export function getScriptHtmlLoaderFile(name: string, scriptSrcs: string[]) {
  const scriptsHtml = scriptSrcs
    .map((scriptSrc) => {
      return `<script type="module" src="${scriptSrc}"></script>`;
    })
    .join("");

  return {
    fileName: `${name}.html`,
    source: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" />${scriptsHtml}</head></html>`,
  };
}

export function getContentScriptLoaderFile(
  scriptFileName: string,
  outputChunkFileName: string
) {
  const outputFile = getOutputFileName(scriptFileName);

  const importPath = outputChunkFileName.startsWith("http")
    ? `'${outputChunkFileName}'`
    : `chrome.runtime.getURL("${outputChunkFileName}")`;

  return {
    fileName: `${outputFile}.js`,
    source: `(async()=>{await import(${importPath})})();`,
  };
}

export function getServiceWorkerLoaderFile(serviceWorkerFileName: string) {
  const importPath = serviceWorkerFileName.startsWith("http")
    ? `${serviceWorkerFileName}`
    : `/${serviceWorkerFileName}`;

  return {
    fileName: `serviceWorker.js`,
    source: `import "${importPath}";`,
  };
}

export function getContentScriptLoaderForOutputChunk(
  contentScriptFileName: string,
  chunk: OutputChunk
): { fileName: string; source?: string } {
  if (!chunk.imports.length && !chunk.dynamicImports.length) {
    return {
      fileName: chunk.fileName,
    };
  }

  return getContentScriptLoaderFile(contentScriptFileName, chunk.fileName);
}
