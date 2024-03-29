import { createHash } from "node:crypto";
import { ViteWebExtensionOptions } from "../../types";
import DevBuilder from "./devBuilder";

export default class DevBuilderManifestV2 extends DevBuilder<chrome.runtime.ManifestV2> {
  protected updateContentSecurityPolicyForHmr(): void {
    this.manifest.content_security_policy =
      this.getContentSecurityPolicyWithHmrSupport(
        this.manifest.content_security_policy
      );
  }

  protected parseInlineScriptHashes(content: string) {
    const matches = content.matchAll(/<script.*?>([^<]+)<\/script>/gs);
    for (const match of matches) {
      const shasum = createHash("sha256");
      shasum.update(match[1]);

      this.inlineScriptHashes.add(`'sha256-${shasum.digest("base64")}'`);
    }
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
  }: {
    fileName: string;
    webAccessibleResource: {
      matches: string[] | undefined;
      extension_ids: string[] | undefined;
      use_dynamic_url?: boolean;
    };
  }): void {
    this.manifest.web_accessible_resources ??= [];
    this.manifest.web_accessible_resources.push(fileName);
  }
}
