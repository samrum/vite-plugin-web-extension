import crypto from "crypto";
import { ensureDir, writeFile } from "fs-extra";
import path from "path";
import { PluginExtras } from "..";
import { getOutputFileName } from "../utils/file";
import { getContentScriptLoaderFile } from "../utils/loader";
import DevBuilder from "./devBuilder";

export default class DevBuilderManifestV2 extends DevBuilder<chrome.runtime.ManifestV2> {
  protected updateContentSecurityPolicyForHmr(
    manifest: chrome.runtime.ManifestV2
  ): chrome.runtime.ManifestV2 {
    manifest.content_security_policy =
      this.getContentSecurityPolicyWithHmrSupport(
        manifest.content_security_policy
      );

    return manifest;
  }

  protected parseInlineScriptHashes(content: string) {
    const matches = content.matchAll(/<script.*?>([^<]+)<\/script>/gs);
    for (const match of matches) {
      const shasum = crypto.createHash("sha256");
      shasum.update(match[1]);

      this.inlineScriptHashes.add(`'sha256-${shasum.digest("base64")}'`);
    }
  }

  protected async writeManifestWebAccessibleScriptFiles(
    manifest: chrome.runtime.ManifestV2,
    webAccessibleScriptsFilter: PluginExtras["webAccessibleScriptsFilter"]
  ) {
    if (!manifest.web_accessible_resources) {
      return;
    }

    for (const [
      webAccessibleResourceIndex,
      resourceFileName,
    ] of manifest.web_accessible_resources.entries()) {
      if (!resourceFileName) {
        continue;
      }

      if (!webAccessibleScriptsFilter(resourceFileName)) continue;

      const outputFileName = getOutputFileName(resourceFileName);

      const scriptLoaderFile = getContentScriptLoaderFile(
        outputFileName,
        `${this.hmrServerOrigin}/${resourceFileName}`
      );

      manifest.web_accessible_resources[webAccessibleResourceIndex] =
        scriptLoaderFile.fileName;

      const outFile = `${this.outDir}/${scriptLoaderFile.fileName}`;

      const outFileDir = path.dirname(outFile);

      await ensureDir(outFileDir);

      await writeFile(outFile, scriptLoaderFile.source);
    }
  }
}
