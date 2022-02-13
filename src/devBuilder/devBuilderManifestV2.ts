import crypto from "crypto";
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
}
