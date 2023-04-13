import MagicString from "magic-string";
import type { Manifest, ManifestChunk, ResolvedConfig, UserConfig } from "vite";
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

  config.build.rollupOptions ??= {};
  config.build.rollupOptions.input ??= {};

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

// Vite asset helper rewrites usages of import.meta.url to self.location for broader
//   browser support, but content scripts need to reference assets via import.meta.url
// This transform rewrites self.location back to import.meta.url
export function transformSelfLocationAssets(
  code: string,
  resolvedViteConfig: ResolvedConfig
) {
  if (code.includes("new URL") && code.includes(`self.location`)) {
    let updatedCode: MagicString | null = null;
    const selfLocationUrlPattern =
      /\bnew\s+URL\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)\s*,\s*self\.location\s*\)/g;

    let match: RegExpExecArray | null;
    while ((match = selfLocationUrlPattern.exec(code))) {
      const { 0: exp, index } = match;

      if (!updatedCode) updatedCode = new MagicString(code);

      updatedCode.overwrite(
        index,
        index + exp.length,
        exp.replace("self.location", "import.meta.url")
      );
    }

    if (updatedCode) {
      return {
        code: updatedCode.toString(),
        map: resolvedViteConfig.build.sourcemap
          ? updatedCode.generateMap({ hires: true })
          : null,
      };
    }
  }

  return null;
}

export function findChunkInManifestByFileName(
  manifest: Manifest,
  fileName: string
): ManifestChunk | undefined {
  return manifest[getNormalizedFileName(fileName)];
}
