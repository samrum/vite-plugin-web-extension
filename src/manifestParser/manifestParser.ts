import { ResolvedConfig, ViteDevServer } from "vite";
import DevBuilder from "../devBuilder/devBuilder";
import { getInputFileName, getOutputFileName } from "../utils/file";
import type {
  EmittedFile,
  OutputAsset,
  OutputBundle,
  OutputChunk,
} from "rollup";
import { getScriptLoaderForOutputChunk } from "../utils/loader";
import {
  getCssAssetInfoFromBundle,
  getChunkInfoFromBundle,
  getOutputInfoFromBundle,
} from "../utils/rollup";
import type { AdditionalInput, ViteWebExtensionOptions } from "../../types";
import { getScriptHtmlLoaderFile } from "../utils/loader";
import { setVirtualModule } from "../utils/virtualModule";

export interface ParseResult<Manifest extends chrome.runtime.Manifest> {
  inputScripts: [string, string][];
  emitFiles: EmittedFile[];
  manifest: Manifest;
}

export default abstract class ManifestParser<
  Manifest extends chrome.runtime.Manifest
> {
  protected inputManifest: Manifest;
  protected viteDevServer: ViteDevServer | undefined;
  protected parsedMetaDataChunkIds = new Set<string>();

  constructor(
    protected pluginOptions: ViteWebExtensionOptions,
    protected viteConfig: ResolvedConfig
  ) {
    this.inputManifest = JSON.parse(
      JSON.stringify(this.pluginOptions.manifest)
    );
  }

  async parseInput(): Promise<ParseResult<Manifest>> {
    const parseResult: ParseResult<Manifest> = {
      manifest: this.inputManifest,
      inputScripts: [],
      emitFiles: [],
    };

    return this.pipe(
      parseResult,
      this.parseInputHtmlFiles,
      this.parseInputContentScripts,
      this.parseInputBackgroundScripts,
      this.parseInputAdditionalInputs,
      ...this.getParseInputMethods()
    );
  }

  async writeDevBuild(devServerPort: number): Promise<void> {
    await this.createDevBuilder().writeBuild({
      devServerPort,
      manifestHtmlFiles: this.getHtmlFileNames(this.inputManifest),
    });
  }

  async parseOutput(bundle: OutputBundle): Promise<ParseResult<Manifest>> {
    let result: ParseResult<Manifest> = {
      inputScripts: [],
      emitFiles: [],
      manifest: this.inputManifest,
    };

    result = await this.parseOutputAdditionalInputs(result, bundle);
    result = await this.parseOutputContentScripts(result, bundle);

    for (const parseMethod of this.getParseOutputMethods()) {
      result = await parseMethod(result, bundle);
    }

    result.emitFiles.push({
      type: "asset",
      fileName: "manifest.json",
      source: JSON.stringify(result.manifest, null, 2),
    });

    return result;
  }

  setDevServer(server: ViteDevServer) {
    this.viteDevServer = server;
  }

  protected abstract createDevBuilder(): DevBuilder<Manifest>;

  protected abstract getHtmlFileNames(manifest: Manifest): string[];

  protected abstract getParseInputMethods(): ((
    result: ParseResult<Manifest>
  ) => ParseResult<Manifest>)[];

  protected abstract getParseOutputMethods(): ((
    result: ParseResult<Manifest>,
    bundle: OutputBundle
  ) => Promise<ParseResult<Manifest>>)[];

  protected abstract parseOutputContentScripts(
    result: ParseResult<Manifest>,
    bundle: OutputBundle
  ): Promise<ParseResult<Manifest>>;

  protected abstract parseOutputAdditionalInputs(
    result: ParseResult<Manifest>,
    bundle: OutputBundle
  ): Promise<ParseResult<Manifest>>;

  protected parseInputAdditionalInputs(
    result: ParseResult<Manifest>
  ): ParseResult<Manifest> {
    if (!this.pluginOptions.additionalInputs) {
      return result;
    }

    Object.values(this.pluginOptions.additionalInputs).forEach(
      (additionalInputArray) => {
        additionalInputArray.forEach((additionalInput) => {
          const fileName =
            typeof additionalInput === "string"
              ? additionalInput
              : additionalInput.fileName;

          if (fileName.includes("*")) {
            throw new Error(
              `additionalInput "${fileName}" is invalid. Must be a single file.`
            );
          }

          this.addInputToParseResult(fileName, result);
        });
      }
    );

    return result;
  }

  protected parseInputHtmlFiles(result: ParseResult<Manifest>) {
    this.getHtmlFileNames(result.manifest).forEach((htmlFileName) =>
      this.parseInputHtmlFile(htmlFileName, result)
    );

    return result;
  }

  protected parseInputContentScripts(
    result: ParseResult<Manifest>
  ): ParseResult<Manifest> {
    result.manifest.content_scripts?.forEach((script) => {
      script.js?.forEach((fileName) =>
        this.addInputToParseResult(fileName, result)
      );

      script.css?.forEach((fileName) =>
        this.addInputToParseResult(fileName, result)
      );
    });

    return result;
  }

  protected parseInputHtmlFile(
    htmlFileName: string | undefined,
    result: ParseResult<Manifest>
  ): ParseResult<Manifest> {
    if (!htmlFileName) {
      return result;
    }

    return this.addInputToParseResult(htmlFileName, result);
  }

  protected parseOutputContentCss(
    cssFileName: string,
    bundle: OutputBundle
  ): { cssFileName: string } {
    const cssAssetInfo = getCssAssetInfoFromBundle(bundle, cssFileName);
    if (!cssAssetInfo) {
      throw new Error(`Failed to find CSS asset info for ${cssFileName}`);
    }

    return {
      cssFileName: cssAssetInfo.fileName,
    };
  }

  protected parseOutputContentScript(
    scriptFileName: string,
    result: ParseResult<Manifest>,
    bundle: OutputBundle
  ): { fileName: string; webAccessibleFiles: Set<string> } {
    const chunkInfo = getChunkInfoFromBundle(bundle, scriptFileName);
    if (!chunkInfo) {
      throw new Error(`Failed to find chunk info for ${scriptFileName}`);
    }

    return this.parseOutputChunk(scriptFileName, chunkInfo, result, bundle);
  }

  protected parseOutputAdditionalInput(
    type: keyof NonNullable<ViteWebExtensionOptions["additionalInputs"]>,
    additionalInput: Exclude<AdditionalInput, string>,
    result: ParseResult<Manifest>,
    bundle: OutputBundle
  ): { webAccessibleFiles: Set<string> } {
    const { fileName, webAccessibleResource } = additionalInput;

    const chunkInfo = getOutputInfoFromBundle(type, bundle, fileName);
    if (!chunkInfo) {
      throw new Error(`Failed to find chunk info for ${fileName}`);
    }

    const parseResult =
      chunkInfo.type === "asset"
        ? this.parseOutputAsset(type, fileName, chunkInfo, result, bundle)
        : this.parseOutputChunk(fileName, chunkInfo, result, bundle);

    if (Boolean(webAccessibleResource)) {
      parseResult.webAccessibleFiles.add(parseResult.fileName);
    } else {
      parseResult.webAccessibleFiles.clear();
    }

    return parseResult;
  }

  private parseOutputAsset(
    type: keyof NonNullable<ViteWebExtensionOptions["additionalInputs"]>,
    inputFileName: string,
    outputAsset: OutputAsset,
    result: ParseResult<Manifest>,
    bundle: OutputBundle
  ): { fileName: string; webAccessibleFiles: Set<string> } {
    delete bundle[outputAsset.fileName];

    const fileName = `${getOutputFileName(
      inputFileName
    )}.${this.getAdditionalInputTypeFileExtension(type)}`;

    result.emitFiles.push({
      type: "asset",
      fileName,
      source: outputAsset.source,
    });

    return {
      fileName,
      webAccessibleFiles: new Set<string>(),
    };
  }

  private parseOutputChunk(
    inputFileName: string,
    outputChunk: OutputChunk,
    result: ParseResult<Manifest>,
    bundle: OutputBundle
  ): { fileName: string; webAccessibleFiles: Set<string> } {
    const scriptLoaderFile = getScriptLoaderForOutputChunk(
      inputFileName,
      outputChunk
    );

    const metadata = this.getMetadataforChunk(
      outputChunk.fileName,
      bundle,
      Boolean(scriptLoaderFile)
    );

    outputChunk.code = outputChunk.code.replace(
      new RegExp("import.meta.PLUGIN_WEB_EXT_CHUNK_CSS_PATHS", "g"),
      `[${[...metadata.css].map((path) => `"${path}"`).join(",")}]`
    );

    const fileName = scriptLoaderFile?.fileName ?? `${outputChunk.name}.js`;

    if (scriptLoaderFile) {
      result.emitFiles.push({
        type: "asset",
        fileName,
        source: scriptLoaderFile.source,
      });
    } else {
      delete bundle[outputChunk.fileName];

      result.emitFiles.push({
        type: "asset",
        fileName,
        source: outputChunk.code,
      });
    }

    return {
      fileName,
      webAccessibleFiles: new Set<string>([
        ...metadata.assets,
        ...metadata.css,
      ]),
    };
  }

  private getAdditionalInputTypeFileExtension(
    type: keyof NonNullable<ViteWebExtensionOptions["additionalInputs"]>
  ): string {
    switch (type) {
      case "html":
        return "html";
      case "scripts":
        return "js";
      case "styles":
        return "css";
      default:
        throw new Error(`Unknown additionalInput type of ${type}`);
    }
  }

  protected addInputToParseResult(
    fileName: string,
    result: ParseResult<Manifest>
  ): ParseResult<Manifest> {
    const inputFile = getInputFileName(fileName, this.viteConfig.root);
    const outputFile = getOutputFileName(fileName);

    result.inputScripts.push([outputFile, inputFile]);

    return result;
  }

  protected pipe<T>(initialValue: T, ...fns: ((result: T) => T)[]): T {
    return fns.reduce(
      (previousValue, fn) => fn.call(this, previousValue),
      initialValue
    );
  }

  private getMetadataforChunk(
    chunkId: string,
    bundle: OutputBundle,
    includeChunkAsAsset: boolean = false,
    metadata: {
      css: Set<string>;
      assets: Set<string>;
    } | null = null
  ): {
    css: Set<string>;
    assets: Set<string>;
  } {
    if (metadata === null) {
      this.parsedMetaDataChunkIds.clear();

      metadata = {
        css: new Set<string>(),
        assets: new Set<string>(),
      };
    }

    if (this.parsedMetaDataChunkIds.has(chunkId)) {
      return metadata;
    }

    const chunkInfo = getChunkInfoFromBundle(bundle, chunkId);
    if (!chunkInfo) {
      return metadata;
    }

    if (includeChunkAsAsset) {
      metadata.assets.add(chunkInfo.fileName);
    }

    chunkInfo.viteMetadata!.importedCss.forEach(metadata.css.add, metadata.css);
    chunkInfo.viteMetadata!.importedAssets.forEach(
      metadata.assets.add,
      metadata.assets
    );

    this.parsedMetaDataChunkIds.add(chunkId);

    chunkInfo.imports.forEach(
      (chunkId) =>
        (metadata = this.getMetadataforChunk(chunkId, bundle, true, metadata))
    );

    chunkInfo.dynamicImports.forEach(
      (chunkId) =>
        (metadata = this.getMetadataforChunk(chunkId, bundle, true, metadata))
    );

    return metadata;
  }

  private parseInputBackgroundScripts(
    result: ParseResult<Manifest>
  ): ParseResult<Manifest> {
    // @ts-expect-error - Force support of event pages in manifest V3 (Firefox)
    if (!result.manifest.background?.scripts) {
      return result;
    }

    const htmlLoaderFile = getScriptHtmlLoaderFile(
      "background",
      // @ts-expect-error - Force support of event pages in manifest V3 (Firefox)
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

    // @ts-expect-error - Force support of event pages in manifest V3 (Firefox)
    delete result.manifest.background.scripts;
    // @ts-expect-error - Force support of event pages in manifest V3 (Firefox)
    result.manifest.background.page = htmlLoaderFile.fileName;

    return result;
  }
}
