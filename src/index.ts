import { createFilter } from "vite";
import type { EmittedFile, OutputBundle } from "rollup";
import type { Plugin, ResolvedConfig } from "vite";
import type { ViteWebExtensionOptions } from "../types";
import { addInputScriptsToOptionsInput } from "./utils/rollup";
import ManifestParser from "./manifestParser/manifestParser";
import ManifestParserFactory from "./manifestParser/manifestParserFactory";
import { getVirtualModule } from "./utils/virtualModule";
import contentScriptStyleHandler from "./middleware/contentScriptStyleHandler";
import {
  transformSelfLocationAssets,
  updateConfigForExtensionSupport,
} from "./utils/vite";

export interface PluginExtras {
  webAccessibleScriptsFilter: ReturnType<typeof createFilter>;
}

export default function webExtension(
  pluginOptions: ViteWebExtensionOptions
): Plugin {
  if (!pluginOptions.manifest) {
    throw new Error("Missing manifest definition");
  }

  let viteConfig: ResolvedConfig;
  let emitQueue: EmittedFile[] = [];
  let manifestParser:
    | ManifestParser<chrome.runtime.ManifestV2>
    | ManifestParser<chrome.runtime.ManifestV3>;

  const webConfig = pluginOptions.webAccessibleScripts;
  let webAccessibleScriptsFilter = createFilter(
    webConfig?.include || /\.([cem]?js|ts)$/,
    webConfig?.exclude || "",
    webConfig?.options
  );

  return {
    name: "webExtension",
    enforce: "post", // required to revert vite asset self.location transform to import.meta.url

    config(config) {
      return updateConfigForExtensionSupport(config, pluginOptions.manifest);
    },

    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
    },

    configureServer(server) {
      server.middlewares.use(contentScriptStyleHandler);

      server.httpServer!.once("listening", () => {
        manifestParser.setDevServer(server);
        manifestParser.writeDevBuild(server.config.server.port!);
      });
    },

    async options(options) {
      manifestParser = ManifestParserFactory.getParser(
        JSON.parse(JSON.stringify(pluginOptions.manifest)),
        { webAccessibleScriptsFilter },
        viteConfig
      );

      const { inputScripts, emitFiles } = await manifestParser.parseInput();

      options.input = addInputScriptsToOptionsInput(
        inputScripts,
        options.input
      );

      emitQueue = emitQueue.concat(emitFiles);

      return options;
    },

    buildStart() {
      emitQueue.forEach((file) => {
        this.emitFile(file);
        this.addWatchFile(file.fileName ?? file.name!);
      });
      emitQueue = [];
    },

    renderDynamicImport() {
      return {
        left: "import((chrome != null ? chrome : browser).runtime.getURL(",
        right: "))",
      };
    },

    resolveId(id) {
      return getVirtualModule(id) ? id : null;
    },

    load(id) {
      return getVirtualModule(id);
    },

    transform(code) {
      return transformSelfLocationAssets(code, viteConfig);
    },

    async generateBundle(_options, bundle) {
      const { emitFiles } = await manifestParser.parseOutput(
        bundle as OutputBundle
      );

      emitFiles.forEach(this.emitFile);
    },
  };
}
