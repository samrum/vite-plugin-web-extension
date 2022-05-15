import { ensureDir, writeFile } from "fs-extra";
import path from "path";
import { PluginExtras } from "..";
import { getOutputFileName } from "../utils/file";
import {
  getContentScriptLoaderFile,
  getServiceWorkerLoaderFile,
} from "../utils/loader";
import DevBuilder from "./devBuilder";

export default class DevBuilderManifestV3 extends DevBuilder<chrome.runtime.ManifestV3> {
  async writeBuildFiles(manifest: chrome.runtime.ManifestV3): Promise<void> {
    await this.writeManifestServiceWorkerFiles(manifest);
  }

  updateContentSecurityPolicyForHmr(
    manifest: chrome.runtime.ManifestV3
  ): chrome.runtime.ManifestV3 {
    manifest.content_security_policy ??= {};

    manifest.content_security_policy.extension_pages =
      this.getContentSecurityPolicyWithHmrSupport(
        manifest.content_security_policy.extension_pages
      );

    return manifest;
  }

  private async writeManifestServiceWorkerFiles(
    manifest: chrome.runtime.ManifestV3
  ) {
    if (!manifest.background?.service_worker) {
      return;
    }

    const fileName = manifest.background?.service_worker;

    const serviceWorkerLoader = getServiceWorkerLoaderFile(
      `${this.hmrServerOrigin}/${fileName}`
    );

    manifest.background.service_worker = serviceWorkerLoader.fileName;

    const outFile = `${this.outDir}/${serviceWorkerLoader.fileName}`;

    const outFileDir = path.dirname(outFile);

    await ensureDir(outFileDir);

    await writeFile(outFile, serviceWorkerLoader.source);
  }

  protected async writeManifestWebAccessibleScriptFiles(
    manifest: chrome.runtime.ManifestV3,
    webAccessibleScriptsFilter: PluginExtras["webAccessibleScriptsFilter"]
  ) {
    if (!manifest.web_accessible_resources) {
      return;
    }

    for (const [
      webAccessibleResourceIndex,
      struct,
    ] of manifest.web_accessible_resources.entries()) {
      if (!struct || !struct.resources.length) {
        continue;
      }

      for (const [scriptJsIndex, fileName] of struct.resources.entries()) {
        if (!webAccessibleScriptsFilter(fileName)) continue;

        const outputFileName = getOutputFileName(fileName);

        const scriptLoaderFile = getContentScriptLoaderFile(
          outputFileName,
          `${this.hmrServerOrigin}/${fileName}`
        );

        manifest.web_accessible_resources[webAccessibleResourceIndex].resources[
          scriptJsIndex
        ] = scriptLoaderFile.fileName;

        const outFile = `${this.outDir}/${scriptLoaderFile.fileName}`;

        const outFileDir = path.dirname(outFile);

        await ensureDir(outFileDir);

        await writeFile(outFile, scriptLoaderFile.source);
      }
    }
  }
}
