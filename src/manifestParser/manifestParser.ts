import { createFilter } from "vite";
import { readFileSync } from "fs-extra";
import { ResolvedConfig, ViteDevServer } from "vite";
import DevBuilder from "../devBuilder/devBuilder";
import { getInputFileName, getOutputFileName } from "../utils/file";
import type { EmittedFile, OutputBundle } from "rollup";
import {
  getContentScriptLoaderForOutputChunk,
  getWebAccessibleScriptLoaderForOutputChunk,
} from "../utils/loader";
import { getChunkInfoFromBundle } from "../utils/rollup";
import type { ViteWebExtensionOptions } from "../../types";
import { getScriptHtmlLoaderFile } from "../utils/loader";
import { setVirtualModule } from "../utils/virtualModule";
import { createWebAccessibleScriptsFilter } from "../utils/filter";

export interface ParseResult<Manifest extends chrome.runtime.Manifest> {
  inputScripts: [string, string][];
  emitFiles: EmittedFile[];
  manifest: Manifest;
}

export default abstract class ManifestParser<
  Manifest extends chrome.runtime.Manifest
> {
  protected inputManifest: Manifest;
  protected webAccessibleScriptsFilter: ReturnType<typeof createFilter>;
  protected viteDevServer: ViteDevServer | undefined;
  protected parsedMetaDataChunkIds = new Set<string>();

  constructor(
    protected pluginOptions: ViteWebExtensionOptions,
    protected viteConfig: ResolvedConfig
  ) {
    this.inputManifest = JSON.parse(
      JSON.stringify(this.pluginOptions.manifest)
    );

    this.webAccessibleScriptsFilter = createWebAccessibleScriptsFilter(
      this.pluginOptions.webAccessibleScripts
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
      this.parseInputWebAccessibleScripts,
      this.parseInputBackgroundScripts,
      ...this.getParseInputMethods()
    );
  }

  async writeDevBuild(devServerPort: number): Promise<void> {
    await this.createDevBuilder().writeBuild({
      devServerPort,
      manifest: this.inputManifest,
      manifestHtmlFiles: this.getHtmlFileNames(this.inputManifest),
    });
  }

  async parseOutput(bundle: OutputBundle): Promise<ParseResult<Manifest>> {
    let result: ParseResult<Manifest> = {
      inputScripts: [],
      emitFiles: [],
      manifest: this.inputManifest,
    };

    result = await this.parseOutputWebAccessibleScripts(result, bundle);
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

  protected abstract parseOutputWebAccessibleScripts(
    result: ParseResult<Manifest>,
    bundle: OutputBundle
  ): Promise<ParseResult<Manifest>>;

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
      script.js?.forEach((scriptFile) => {
        const inputFile = getInputFileName(scriptFile, this.viteConfig.root);
        const outputFile = getOutputFileName(scriptFile);

        result.inputScripts.push([outputFile, inputFile]);
      });

      script.css?.forEach((cssFile) => {
        result.emitFiles.push({
          type: "asset",
          fileName: cssFile,
          source: readFileSync(cssFile, "utf-8"),
        });
      });
    });

    return result;
  }

  protected abstract parseInputWebAccessibleScripts(
    result: ParseResult<Manifest>
  ): ParseResult<Manifest>;

  protected parseInputHtmlFile(
    htmlFileName: string | undefined,
    result: ParseResult<Manifest>
  ): ParseResult<Manifest> {
    if (!htmlFileName) {
      return result;
    }

    const inputFile = getInputFileName(htmlFileName, this.viteConfig.root);
    const outputFile = getOutputFileName(htmlFileName);

    result.inputScripts.push([outputFile, inputFile]);

    return result;
  }

  protected parseOutputContentScript(
    scriptFileName: string,
    result: ParseResult<Manifest>,
    bundle: OutputBundle
  ): { scriptFileName: string; webAccessibleFiles: Set<string> } {
    const chunkInfo = getChunkInfoFromBundle(bundle, scriptFileName);
    if (!chunkInfo) {
      throw new Error(`Failed to find chunk info for ${scriptFileName}`);
    }

    const scriptLoaderFile = getContentScriptLoaderForOutputChunk(
      scriptFileName,
      chunkInfo
    );

    if (scriptLoaderFile.source) {
      result.emitFiles.push({
        type: "asset",
        fileName: scriptLoaderFile.fileName,
        source: scriptLoaderFile.source,
      });
    }

    const metadata = this.getMetadataforChunk(
      chunkInfo.fileName,
      bundle,
      Boolean(scriptLoaderFile.source)
    );

    chunkInfo.code = chunkInfo.code.replace(
      new RegExp("import.meta.PLUGIN_WEB_EXT_CHUNK_CSS_PATHS", "g"),
      `[${[...metadata.css].map((path) => `"${path}"`).join(",")}]`
    );

    return {
      scriptFileName: scriptLoaderFile.fileName,
      webAccessibleFiles: new Set([...metadata.assets, ...metadata.css]),
    };
  }

  protected parseOutputWebAccessibleScript(
    scriptFileName: string,
    result: ParseResult<Manifest>,
    bundle: OutputBundle
  ): { scriptFileName: string; webAccessibleFiles: Set<string> } {
    const chunkInfo = getChunkInfoFromBundle(bundle, scriptFileName);
    if (!chunkInfo) {
      throw new Error(`Failed to find chunk info for ${scriptFileName}`);
    }

    const scriptLoaderFile = getWebAccessibleScriptLoaderForOutputChunk(
      scriptFileName,
      chunkInfo
    );

    if (scriptLoaderFile.source) {
      result.emitFiles.push({
        type: "asset",
        fileName: scriptLoaderFile.fileName,
        source: scriptLoaderFile.source,
      });
    }

    const metadata = this.getMetadataforChunk(
      chunkInfo.fileName,
      bundle,
      Boolean(scriptLoaderFile.source)
    );

    chunkInfo.code = chunkInfo.code.replace(
      new RegExp("import.meta.PLUGIN_WEB_EXT_CHUNK_CSS_PATHS", "g"),
      `[${[...metadata.css].map((path) => `"${path}"`).join(",")}]`
    );

    return {
      scriptFileName: scriptLoaderFile.fileName,
      webAccessibleFiles: new Set([...metadata.assets, ...metadata.css]),
    };
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
    includeChunkAsAsset: boolean,
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

    chunkInfo.viteMetadata.importedCss.forEach(metadata.css.add, metadata.css);
    chunkInfo.viteMetadata.importedAssets.forEach(
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
    // @ts-expect-error - Force support of event pages in manifest V3
    if (!result.manifest.background?.scripts) {
      return result;
    }

    const htmlLoaderFile = getScriptHtmlLoaderFile(
      "background",
      // @ts-expect-error - Force support of event pages in manifest V3
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

    // @ts-expect-error - Force support of event pages in manifest V3
    delete result.manifest.background.scripts;
    // @ts-expect-error - Force support of event pages in manifest V3
    result.manifest.background.page = htmlLoaderFile.fileName;

    return result;
  }
}
