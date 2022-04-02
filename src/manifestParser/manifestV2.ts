import { getScriptHtmlLoaderFile } from "../utils/loader";
import { setVirtualModule } from "../utils/virtualModule";
import { ParseResult } from "./manifestParser";
import {
  isSingleHtmlFilename,
  getOutputFileName,
  getInputFileName,
} from "../utils/file";
import DevBuilderManifestV2 from "../devBuilder/devBuilderManifestV2";
import ManifestParser from "./manifestParser";
import DevBuilder from "./../devBuilder/devBuilder";
import { OutputBundle } from "rollup";

type Manifest = chrome.runtime.ManifestV2;
type ManifestParseResult = ParseResult<Manifest>;

export default class ManifestV2 extends ManifestParser<Manifest> {
  protected createDevBuilder(): DevBuilder<Manifest> {
    return new DevBuilderManifestV2(this.viteConfig, this.viteDevServer);
  }

  protected getHtmlFileNames(manifest: Manifest): string[] {
    return [
      manifest.background?.page,
      manifest.browser_action?.default_popup,
      manifest.options_ui?.page,
      ...(manifest.web_accessible_resources ?? []).filter(isSingleHtmlFilename),
    ].filter((fileName): fileName is string => typeof fileName === "string");
  }

  protected getParseInputMethods(): ((
    result: ManifestParseResult
  ) => ManifestParseResult)[] {
    return [this.parseInputBackgroundScripts];
  }

  protected getParseOutputMethods(): ((
    result: ManifestParseResult
  ) => Promise<ManifestParseResult>)[] {
    return [];
  }

  private parseInputBackgroundScripts(
    result: ManifestParseResult
  ): ManifestParseResult {
    if (!result.manifest.background?.scripts) {
      return result;
    }

    const htmlLoaderFile = getScriptHtmlLoaderFile(
      "background",
      result.manifest.background.scripts.map((script) => {
        if (/^[\.\/]/.test(script)) {
          return script;
        }

        return `/${script}`;
      })
    );

    const inputFile = getInputFileName(
      htmlLoaderFile.fileName,
      this.viteConfig.root
    );
    const outputFile = getOutputFileName(htmlLoaderFile.fileName);

    result.inputScripts.push([outputFile, inputFile]);

    setVirtualModule(inputFile, htmlLoaderFile.source);

    delete result.manifest.background.scripts;
    result.manifest.background.page = htmlLoaderFile.fileName;

    return result;
  }

  protected async parseOutputContentScripts(
    result: ManifestParseResult,
    bundle: OutputBundle
  ): Promise<ManifestParseResult> {
    const webAccessibleResources = new Set(
      result.manifest.web_accessible_resources ?? []
    );

    result.manifest.content_scripts?.forEach((script) => {
      script.js?.forEach((scriptFileName, index) => {
        const parsedContentScript = this.parseOutputContentScript(
          scriptFileName,
          result,
          bundle
        );

        script.js![index] = parsedContentScript.scriptFileName;

        parsedContentScript.webAccessibleFiles.forEach(
          webAccessibleResources.add,
          webAccessibleResources
        );
      });
    });

    if (webAccessibleResources.size > 0) {
      if (this.viteConfig.build.watch) {
        // expose all files in watch mode to allow web-ext reloading to work when manifest changes are not applied on reload (eg. Firefox)
        webAccessibleResources.add("*.js");
      }

      result.manifest.web_accessible_resources = Array.from(
        webAccessibleResources
      );
    }

    return result;
  }
}
