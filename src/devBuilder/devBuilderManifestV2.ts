import DevBuilder from "./devBuilder";

export default class DevBuilderManifestV2 extends DevBuilder<chrome.runtime.ManifestV2> {
  protected async writeBuildFiles(): Promise<void> {}

  protected updateContentSecurityPolicyForHmr(
    manifest: chrome.runtime.ManifestV2
  ): chrome.runtime.ManifestV2 {
    manifest.content_security_policy =
      this.getContentSecurityPolicyWithHmrSupport(
        manifest.content_security_policy
      );

    return manifest;
  }
}
