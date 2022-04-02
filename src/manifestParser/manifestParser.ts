import { readFileSync } from "fs-extra";
import { ResolvedConfig, ViteDevServer } from "vite";
import DevBuilder from "../devBuilder/devBuilder";
import { getInputFileName, getOutputFileName } from "../utils/file";
import type { EmittedFile, OutputBundle } from "rollup";
import { getContentScriptLoaderForOutputChunk } from "../utils/loader";
import { getChunkInfoFromBundle } from "../utils/rollup";

export interface ParseResult<Manifest extends chrome.runtime.Manifest> {
  inputScripts: [string, string][];
  emitFiles: EmittedFile[];
  manifest: Manifest;
}

export default abstract class ManifestParser<
  Manifest extends chrome.runtime.Manifest
> {
  protected viteDevServer: ViteDevServer | undefined;

  constructor(
    protected inputManifest: Manifest,
    protected viteConfig: ResolvedConfig
  ) {}

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

    return {
      scriptFileName: scriptLoaderFile.fileName,
      webAccessibleFiles: this.getWebAccessibleFilesForOutputChunk(
        chunkInfo.fileName,
        bundle,
        Boolean(scriptLoaderFile.source)
      ),
    };
  }

  protected pipe<T>(initialValue: T, ...fns: ((result: T) => T)[]): T {
    return fns.reduce(
      (previousValue, fn) => fn.call(this, previousValue),
      initialValue
    );
  }

  private getWebAccessibleFilesForOutputChunk(
    chunkId: string,
    bundle: OutputBundle,
    includeChunkFile = true
  ): Set<string> {
    const files = new Set<string>();

    const chunkInfo = getChunkInfoFromBundle(bundle, chunkId);
    if (!chunkInfo) {
      return files;
    }

    if (includeChunkFile) {
      files.add(chunkInfo.fileName);
    }

    chunkInfo.viteMetadata.importedCss.forEach(files.add, files);
    chunkInfo.viteMetadata.importedAssets.forEach(files.add, files);

    chunkInfo.imports.forEach((chunkId) =>
      this.getWebAccessibleFilesForOutputChunk(chunkId, bundle).forEach(
        files.add,
        files
      )
    );

    chunkInfo.dynamicImports.forEach((chunkId) =>
      this.getWebAccessibleFilesForOutputChunk(chunkId, bundle).forEach(
        files.add,
        files
      )
    );

    return files;
  }
}
