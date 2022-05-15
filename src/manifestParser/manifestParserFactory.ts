import { ResolvedConfig } from "vite";
import { PluginExtras } from "..";
import ManifestParser from "./manifestParser";
import ManifestV2 from "./manifestV2";
import ManifestV3 from "./manifestV3";

export default class ManifestParserFactory {
  static getParser(
    manifest: chrome.runtime.Manifest,
    pluginExtras: PluginExtras,
    viteConfig: ResolvedConfig
  ):
    | ManifestParser<chrome.runtime.ManifestV2>
    | ManifestParser<chrome.runtime.ManifestV3> {
    switch (manifest.manifest_version) {
      case 2:
        return new ManifestV2(manifest, pluginExtras, viteConfig);
      case 3:
        return new ManifestV3(manifest, pluginExtras, viteConfig);
      default:
        throw new Error(
          `No parser available for manifest_version ${
            // @ts-expect-error - Allow showing manifest version for invalid usage
            manifest.manifest_version ?? 0
          }`
        );
    }
  }
}
