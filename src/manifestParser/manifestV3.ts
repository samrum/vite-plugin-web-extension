import { OutputBundle } from "rollup";
import { ParseResult } from "./manifestParser";
import { getOutputFileName, getInputFileName } from "../utils/file";
import ManifestParser from "./manifestParser";
import DevBuilder from "../devBuilder/devBuilder";
import { getServiceWorkerLoaderFile } from "../utils/loader";
import DevBuilderManifestV3 from "../devBuilder/devBuilderManifestV3";
import { getChunkInfoFromBundle } from "../utils/rollup";
import { ViteWebExtensionOptions } from "../../types";

type Manifest = chrome.runtime.ManifestV3;
type ManifestParseResult = ParseResult<Manifest>;

export default class ManifestV3 extends ManifestParser<Manifest> {
  protected createDevBuilder(): DevBuilder<Manifest> {
    return new DevBuilderManifestV3(
      this.viteConfig,
      this.pluginOptions,
      this.viteDevServer,
      this.inputManifest
    );
  }

  protected getHtmlFileNames(manifest: Manifest): string[] {
    return [
      manifest.action?.default_popup,
      manifest.options_ui?.page,
      manifest.devtools_page,
      manifest.chrome_url_overrides?.newtab,
      manifest.chrome_url_overrides?.history,
      manifest.chrome_url_overrides?.bookmarks,
    ].filter((fileName): fileName is string => typeof fileName === "string");
  }

  protected getParseInputMethods(): ((
    result: ManifestParseResult
  ) => ManifestParseResult)[] {
    return [this.parseInputBackgroundServiceWorker];
  }

  protected getParseOutputMethods(): ((
    result: ManifestParseResult,
    bundle: OutputBundle
  ) => Promise<ManifestParseResult>)[] {
    return [this.parseOutputServiceWorker];
  }

  protected parseInputBackgroundServiceWorker(
    result: ManifestParseResult
  ): ManifestParseResult {
    if (!result.manifest.background?.service_worker) {
      return result;
    }

    const serviceWorkerScript = result.manifest.background?.service_worker;

    const inputFile = getInputFileName(
      serviceWorkerScript,
      this.viteConfig.root
    );
    const outputFile = getOutputFileName(serviceWorkerScript);

    result.inputScripts.push([outputFile, inputFile]);

    result.manifest.background.type = "module";

    return result;
  }

  protected async parseOutputContentScripts(
    result: ManifestParseResult,
    bundle: OutputBundle
  ): Promise<ManifestParseResult> {
    const webAccessibleResources = new Set<
      Exclude<
        chrome.runtime.ManifestV3["web_accessible_resources"],
        undefined
      >[number]
    >([...(result.manifest.web_accessible_resources ?? [])]);

    result.manifest.content_scripts?.forEach((script) => {
      script.js?.forEach((scriptFileName, index) => {
        const parsedContentScript = this.parseOutputContentScript(
          scriptFileName,
          result,
          bundle
        );

        script.js![index] = parsedContentScript.scriptFileName;

        if (parsedContentScript.webAccessibleFiles.size) {
          const resource = {
            resources: Array.from(parsedContentScript.webAccessibleFiles),
            matches: script.matches!.map((matchPattern) => {
              const pathMatch = /[^:\/]\//.exec(matchPattern);
              if (!pathMatch) {
                return matchPattern;
              }

              const path = matchPattern.slice(pathMatch.index + 1);
              if (["/", "/*"].includes(path)) {
                return matchPattern;
              }

              return matchPattern.replace(path, "/*");
            }),
          };

          if (this.pluginOptions.useDynamicUrlContentScripts !== false) {
            // @ts-ignore - use_dynamic_url is supported, but not typed
            resource.use_dynamic_url = true;
          }

          webAccessibleResources.add(resource);
        }
      });

      script.css?.forEach((cssFileName, index) => {
        const parsedContentCss = this.parseOutputContentCss(
          cssFileName,
          bundle
        );

        script.css![index] = parsedContentCss.cssFileName;
      });
    });

    if (webAccessibleResources.size > 0) {
      result.manifest.web_accessible_resources = Array.from(
        webAccessibleResources
      );
    }

    return result;
  }

  protected async parseOutputAdditionalInputs(
    result: ManifestParseResult,
    bundle: OutputBundle
  ): Promise<ManifestParseResult> {
    if (!this.pluginOptions.additionalInputs) {
      return result;
    }

    for (const [type, inputs] of Object.entries(
      this.pluginOptions.additionalInputs
    )) {
      for (const input of inputs) {
        const fileName = typeof input === "string" ? input : input.fileName;

        const parsedFile = this.parseOutputAdditionalInput(
          type as keyof NonNullable<
            ViteWebExtensionOptions["additionalInputs"]
          >,
          fileName,
          result,
          bundle,
          typeof input !== "string" && Boolean(input.webAccessibleResource)
        );

        if (parsedFile.webAccessibleFiles.size) {
          result.manifest.web_accessible_resources ??= [];
          const resourceProperties =
            typeof input === "string" || input.webAccessibleResource === true
              ? {
                  matches: ["<all_urls>"],
                }
              : input.webAccessibleResource;

          // @ts-expect-error - allow additional web_accessible_resources properties
          result.manifest.web_accessible_resources.push({
            resources: [...parsedFile.webAccessibleFiles],
            ...resourceProperties,
          });
        }
      }
    }

    return result;
  }

  protected async parseOutputServiceWorker(
    result: ManifestParseResult,
    bundle: OutputBundle
  ): Promise<ManifestParseResult> {
    const serviceWorkerFileName = result.manifest.background?.service_worker;

    if (!serviceWorkerFileName) {
      return result;
    }

    const chunkInfo = getChunkInfoFromBundle(bundle, serviceWorkerFileName);
    if (!chunkInfo) {
      throw new Error(`Failed to find chunk info for ${serviceWorkerFileName}`);
    }

    const serviceWorkerLoader = getServiceWorkerLoaderFile(chunkInfo.fileName);

    result.manifest.background!.service_worker = serviceWorkerLoader.fileName;

    result.emitFiles.push({
      type: "asset",
      fileName: serviceWorkerLoader.fileName,
      source: serviceWorkerLoader.source,
    });

    return result;
  }
}
