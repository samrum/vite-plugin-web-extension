import { OutputBundle } from "rollup";
import { URL } from "url";
import { ParseResult } from "./manifestParser";
import {
  isSingleHtmlFilename,
  getOutputFileName,
  getInputFileName,
} from "../utils/file";
import ManifestParser from "./manifestParser";
import DevBuilder from "../devBuilder/devBuilder";
import { getServiceWorkerLoaderFile } from "../utils/loader";
import DevBuilderManifestV3 from "../devBuilder/devBuilderManifestV3";
import { getChunkInfoFromBundle } from "../utils/rollup";

type Manifest = chrome.runtime.ManifestV3;
type ManifestParseResult = ParseResult<Manifest>;

export default class ManifestV3 extends ManifestParser<Manifest> {
  protected createDevBuilder(): DevBuilder<Manifest> {
    return new DevBuilderManifestV3(
      this.viteConfig,
      this.pluginExtras,
      this.viteDevServer
    );
  }

  protected getHtmlFileNames(manifest: Manifest): string[] {
    const webAccessibleResourcesHtmlFileNames: string[] = [];

    (manifest.web_accessible_resources ?? []).forEach(({ resources }) =>
      resources.filter(isSingleHtmlFilename).forEach((html) => {
        webAccessibleResourcesHtmlFileNames.push(html);
      })
    );

    return [
      manifest.action?.default_popup,
      manifest.options_ui?.page,
      manifest.devtools_page,
      manifest.chrome_url_overrides?.newtab,
      manifest.chrome_url_overrides?.history,
      manifest.chrome_url_overrides?.bookmarks,
      ...webAccessibleResourcesHtmlFileNames,
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

  protected parseInputWebAccessibleScripts(
    result: ParseResult<Manifest>
  ): ParseResult<Manifest> {
    result.manifest.web_accessible_resources?.forEach((struct) => {
      struct.resources.forEach((resource) => {
        if (resource.includes("*")) return;

        const inputFile = getInputFileName(resource, this.viteConfig.root);
        const outputFile = getOutputFileName(resource);

        if (this.pluginExtras.webAccessibleScriptsFilter(inputFile)) {
          result.inputScripts.push([outputFile, inputFile]);
        }
      });
    });

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
    >();

    result.manifest.content_scripts?.forEach((script) => {
      script.js?.forEach((scriptFileName, index) => {
        const parsedContentScript = this.parseOutputContentScript(
          scriptFileName,
          result,
          bundle
        );

        script.js![index] = parsedContentScript.scriptFileName;

        if (parsedContentScript.webAccessibleFiles.size) {
          webAccessibleResources.add({
            resources: Array.from(parsedContentScript.webAccessibleFiles),
            matches: script.matches!.map((matchPattern) => {
              const url = new URL(matchPattern);

              if (url.pathname === "/") {
                return `${url}`;
              }

              return `${url.origin}/*`;
            }),
            // @ts-ignore - use_dynamic_url is a newly supported option
            use_dynamic_url: true,
          });
        }
      });
    });

    (result.manifest.web_accessible_resources ?? []).forEach((struct) => {
      const flattenedResources: string[] = struct.resources.flatMap(
        (resourceFileName) => {
          if (this.pluginExtras.webAccessibleScriptsFilter(resourceFileName)) {
            const parsedWebAccessibleScript = this.parseOutputContentScript(
              resourceFileName,
              result,
              bundle
            );

            // merge `scriptFileName` along with the set of resources the script imports
            return [
              parsedWebAccessibleScript.scriptFileName,
              ...parsedWebAccessibleScript.webAccessibleFiles,
            ];
          }

          // include non-script resources as-is
          return resourceFileName;
        }
      );

      // removes any duplicates from the flattened resources
      struct.resources = Array.from(new Set(flattenedResources));

      webAccessibleResources.add(struct);
    });

    if (webAccessibleResources.size > 0) {
      result.manifest.web_accessible_resources = Array.from(
        webAccessibleResources
      );
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
