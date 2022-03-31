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

type Manifest = chrome.runtime.ManifestV3;
type ManifestParseResult = ParseResult<Manifest>;

export default class ManifestV3 extends ManifestParser<Manifest> {
  protected createDevBuilder(): DevBuilder<Manifest> {
    return new DevBuilderManifestV3(this.viteConfig, this.viteDevServer);
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
      ...webAccessibleResourcesHtmlFileNames,
    ].filter((fileName): fileName is string => typeof fileName === "string");
  }

  protected getParseInputMethods(): ((
    result: ManifestParseResult
  ) => ManifestParseResult)[] {
    return [this.parseInputBackgroundServiceWorker];
  }

  protected getParseOutputMethods(): ((
    result: ManifestParseResult
  ) => Promise<ManifestParseResult>)[] {
    return [this.parseOutputServiceWorker.bind(this)];
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
    result: ManifestParseResult
  ): Promise<ManifestParseResult> {
    const webAccessibleResources = new Set(
      result.manifest.web_accessible_resources ?? []
    );

    result.manifest.content_scripts?.forEach((script) => {
      script.js?.forEach((scriptFileName, index) => {
        const parsedContentScript = this.parseOutputContentScript(
          scriptFileName,
          result
        );

        script.js![index] = parsedContentScript.scriptFileName;

        if (parsedContentScript.webAccessibleFiles.size) {
          webAccessibleResources.add({
            resources: Array.from(parsedContentScript.webAccessibleFiles),
            matches: script.matches!,
            // @ts-ignore - use_dynamic_url is a newly supported option
            use_dynamic_url: true,
          });
        }
      });
    });

    if (webAccessibleResources.size > 0) {
      result.manifest.web_accessible_resources = Array.from(
        webAccessibleResources
      );
    }

    return result;
  }

  protected async parseOutputServiceWorker(
    result: ManifestParseResult
  ): Promise<ManifestParseResult> {
    const serviceWorkerFileName = result.manifest.background?.service_worker;

    if (!serviceWorkerFileName) {
      return result;
    }

    const data = this.getRenderedChunk(serviceWorkerFileName);
    if (!data) {
      throw new Error(
        `Failed to find rendered chunk for ${serviceWorkerFileName}`
      );
    }

    const serviceWorkerLoader = getServiceWorkerLoaderFile(data.fileName);

    result.manifest.background!.service_worker = serviceWorkerLoader.fileName;

    result.emitFiles.push({
      type: "asset",
      fileName: serviceWorkerLoader.fileName,
      source: serviceWorkerLoader.source,
    });

    return result;
  }
}
