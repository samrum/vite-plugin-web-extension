import { ensureDir, writeFile } from "fs-extra";
import path from "path";
import { getServiceWorkerLoaderFile } from "../utils/loader";
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
}
