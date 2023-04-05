import { ParseResult } from "./manifestParser";
import DevBuilderManifestV2 from "../devBuilder/devBuilderManifestV2";
import ManifestParser from "./manifestParser";
import DevBuilder from "./../devBuilder/devBuilder";
import { OutputBundle } from "rollup";
import { ViteWebExtensionOptions } from "../../types";

type Manifest = chrome.runtime.ManifestV2;
type ManifestParseResult = ParseResult<Manifest>;

export default class ManifestV2 extends ManifestParser<Manifest> {
  protected createDevBuilder(): DevBuilder<Manifest> {
    return new DevBuilderManifestV2(
      this.viteConfig,
      this.pluginOptions,
      this.viteDevServer,
      this.inputManifest
    );
  }

  protected getHtmlFileNames(manifest: Manifest): string[] {
    return [
      manifest.background?.page,
      manifest.browser_action?.default_popup,
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
    return [];
  }

  protected getParseOutputMethods(): ((
    result: ManifestParseResult
  ) => Promise<ManifestParseResult>)[] {
    return [];
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

        script.js![index] = parsedContentScript.fileName;

        parsedContentScript.webAccessibleFiles.forEach(
          webAccessibleResources.add,
          webAccessibleResources
        );
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
        const { fileName, webAccessibleResource = false } =
          typeof input === "string" ? { fileName: input } : input;

        const parsedFile = this.parseOutputAdditionalInput(
          type as keyof NonNullable<
            ViteWebExtensionOptions["additionalInputs"]
          >,
          fileName,
          result,
          bundle,
          Boolean(webAccessibleResource)
        );

        if (parsedFile.webAccessibleFiles.size) {
          result.manifest.web_accessible_resources = [
            ...(result.manifest.web_accessible_resources ?? []),
            ...parsedFile.webAccessibleFiles,
          ];
        }
      }
    }

    return result;
  }
}
