import type { Manifest, ManifestChunk, UserConfig } from "vite";
import { getNormalizedFileName } from "./file";

// Update vite user config with settings necessary for the plugin to work
export function updateConfigForExtensionSupport(
  config: UserConfig,
  manifest: chrome.runtime.Manifest
): UserConfig {
  config.build ??= {};

  if (!config.build.target) {
    switch (manifest.manifest_version) {
      case 2:
        config.build.target = ["chrome64", "firefox89"]; // minimum browsers with import.meta.url and content script dynamic import
        break;
      case 3:
        config.build.target = ["chrome91"];
        break;
    }
  }

  config.build.modulePreload ??= false;

  config.build.rolldownOptions ??= {};
  config.build.rolldownOptions.input ??= {};

  config.optimizeDeps ??= {};
  config.optimizeDeps.exclude = [
    ...(config.optimizeDeps.exclude ?? []),
    "/@vite/client",
  ];

  config.server ??= {};

  if (config.server.hmr === true || !config.server.hmr) {
    config.server.hmr = {};
  }

  config.server.hmr.protocol = "ws"; // required for content script hmr to work on https
  config.server.hmr.host = "localhost";

  return config;
}

export function findChunkInManifestByFileName(
  manifest: Manifest,
  fileName: string
): ManifestChunk | undefined {
  return manifest[getNormalizedFileName(fileName)];
}
