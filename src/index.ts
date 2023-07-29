import type { EmittedFile, OutputBundle } from "rollup";
import type { Plugin, ResolvedConfig } from "vite";
import type { SafariBuildOptions, ViteWebExtensionOptions } from "../types";
import ManifestParser from "./manifestParser/manifestParser";
import ManifestParserFactory from "./manifestParser/manifestParserFactory";
import viteClientModifier from "./middleware/viteClientModifier";
import { convertToSafariWebExtension } from "./utils/convertToSafariWebExtension";
import { addInputScriptsToOptionsInput } from "./utils/rollup";
import { getVirtualModule } from "./utils/virtualModule";
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
      server.middlewares.use(viteClientModifier);

      server.httpServer!.once("listening", () => {
        manifestParser.setDevServer(server);
        manifestParser.writeDevBuild(server.config.server.port!);
      });
    },

    async options(options) {
      manifestParser = ManifestParserFactory.getParser(
        pluginOptions,
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

    async writeBundle(options) {
      if (!pluginOptions.safari || !options.dir) {
        return;
      }

      (this as any).info("Building safari extension...");

      try {
        await convertToSafariWebExtension(options.dir, {
          appName: pluginOptions.manifest.name,
          ...(pluginOptions.safari as SafariBuildOptions),
        });
      } catch (error) {
        this.error(`Could not create Safari build: ${error}`);
      }
    },
  };
}
