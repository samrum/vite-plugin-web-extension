import type { EmittedFile, OutputBundle } from "rollup";
import type { Plugin, ResolvedConfig } from "vite";
import type { ViteWebExtensionOptions } from "../types";
import { addInputScriptsToOptionsInput } from "./utils/rollup";
import ManifestParser from "./manifestParser/manifestParser";
import ManifestParserFactory from "./manifestParser/manifestParserFactory";
import { DUMMY_PLUGIN_INPUT_ID, getVirtualModule } from "./utils/virtualModule";
import contentScriptStyleHandler from "./middleware/contentScriptStyleHandler";
import {
  transformSelfLocationAssets,
  updateConfigForExtensionSupport,
} from "./utils/vite";

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
        viteConfig
      );

      const { inputScripts, emitFiles } = await manifestParser.parseInput();

      options.input = addInputScriptsToOptionsInput(
        inputScripts,
        options.input
      );

      delete options.input[DUMMY_PLUGIN_INPUT_ID];

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

    resolveId(id) {
      const module = getVirtualModule(id);

      return module ? id : null;
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
