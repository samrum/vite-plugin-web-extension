import { ensureDir, writeFile } from "fs-extra";
import path from "path";
import { ViteWebExtensionOptions } from "../../types";
import { getServiceWorkerLoaderFile } from "../utils/loader";
import DevBuilder from "./devBuilder";

export default class DevBuilderManifestV3 extends DevBuilder<chrome.runtime.ManifestV3> {
  async writeBuildFiles(): Promise<void> {
    await this.writeManifestServiceWorkerFiles(this.manifest);
  }

  updateContentSecurityPolicyForHmr(): void {
    this.manifest.content_security_policy ??= {};

    this.manifest.content_security_policy.extension_pages =
      this.getContentSecurityPolicyWithHmrSupport(
        this.manifest.content_security_policy.extension_pages
      );
  }

  private async writeManifestServiceWorkerFiles(
    manifest: chrome.runtime.ManifestV3
  ) {
    if (!manifest.background?.service_worker) {
      return;
    }

    const fileName = manifest.background?.service_worker;

    const serviceWorkerLoader = getServiceWorkerLoaderFile([
      this.hmrViteClientUrl,
      `${this.hmrServerOrigin}/${fileName}`,
    ]);

    manifest.background.service_worker = serviceWorkerLoader.fileName;

    const outFile = `${this.outDir}/${serviceWorkerLoader.fileName}`;

    const outFileDir = path.dirname(outFile);

    await ensureDir(outFileDir);

    await writeFile(outFile, serviceWorkerLoader.source);
  }

  protected async writeManifestAdditionalInputFiles(): Promise<void> {
    if (!this.pluginOptions.additionalInputs) {
      return;
    }

    for (const [type, inputs] of Object.entries(
      this.pluginOptions.additionalInputs
    )) {
      if (!inputs) {
        return;
      }

      for (const input of inputs) {
        if (!input) {
          continue;
        }

        await this.writeManifestAdditionalInputFile(
          type as keyof NonNullable<
            ViteWebExtensionOptions["additionalInputs"]
          >,
          input
        );
      }
    }
  }

  protected addWebAccessibleResource({
    fileName,
    webAccessibleResource,
  }: {
    fileName: string;
    webAccessibleResource: {
      matches: string[] | undefined;
      extension_ids: string[] | undefined;
      use_dynamic_url?: boolean;
    };
  }): void {
    this.manifest.web_accessible_resources ??= [];

    if (this.pluginOptions.useDynamicUrlWebAccessibleResources === false) {
      delete webAccessibleResource["use_dynamic_url"];
    }

    // @ts-expect-error - allow additional web_accessible_resources properties
    this.manifest.web_accessible_resources.push({
      resources: [fileName],
      ...webAccessibleResource,
    });
  }
}
