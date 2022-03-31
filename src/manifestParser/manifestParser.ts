import { readFileSync } from "fs-extra";
import { ResolvedConfig, ViteDevServer } from "vite";
import DevBuilder from "../devBuilder/devBuilder";
import {
  getInputFileName,
  getNormalizedFileName,
  getOutputFileName,
} from "../utils/file";
import type {
  EmittedFile,
  RenderedChunk as RenderedChunk_Rollup,
} from "rollup";
import { getContentScriptLoaderForRenderedChunk } from "../utils/loader";

export interface ParseResult<Manifest extends chrome.runtime.Manifest> {
  inputScripts: [string, string][];
  emitFiles: EmittedFile[];
  manifest: Manifest;
}

interface RenderedChunk extends RenderedChunk_Rollup {
  viteMetadata: {
    importedCss: Set<string>;
    importedAssets: Set<string>;
  };
}

export default abstract class ManifestParser<
  Manifest extends chrome.runtime.Manifest
> {
  protected viteDevServer: ViteDevServer | undefined;

  protected renderedChunks = new Set<RenderedChunk>();

  constructor(
    protected inputManifest: Manifest,
    protected viteConfig: ResolvedConfig
  ) {}

  setRenderedChunk(chunk: RenderedChunk) {
    this.renderedChunks.add(chunk);
  }

  resetRenderedChunks() {
    this.renderedChunks = new Set<RenderedChunk>();
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

  async parseOutput(): Promise<ParseResult<Manifest>> {
    let result: ParseResult<Manifest> = {
      inputScripts: [],
      emitFiles: [],
      manifest: this.inputManifest,
    };

    result = await this.parseOutputContentScripts(result);

    for (const parseMethod of this.getParseOutputMethods()) {
      result = await parseMethod(result);
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
    result: ParseResult<Manifest>
  ) => Promise<ParseResult<Manifest>>)[];

  protected abstract parseOutputContentScripts(
    result: ParseResult<Manifest>
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

  protected getRenderedChunk(chunkId: string): RenderedChunk | undefined {
    const normalizedId = getNormalizedFileName(chunkId);

    return [...this.renderedChunks].find(
      (chunk) =>
        chunk.facadeModuleId?.endsWith(normalizedId) ||
        chunk.fileName.endsWith(normalizedId)
    );
  }

  protected parseOutputContentScript(
    scriptFileName: string,
    result: ParseResult<Manifest>
  ): { scriptFileName: string; webAccessibleFiles: Set<string> } {
    const data = this.getRenderedChunk(scriptFileName);
    if (!data) {
      throw new Error(`Failed to find rendered chunk for ${scriptFileName}`);
    }

    const scriptLoaderFile = getContentScriptLoaderForRenderedChunk(
      scriptFileName,
      data
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
      webAccessibleFiles: this.getWebAccessibleFilesForRenderedChunk(
        data.fileName,
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

  private getWebAccessibleFilesForRenderedChunk(
    chunkId: string,
    includeChunkFile = true
  ): Set<string> {
    const files = new Set<string>();

    const data = this.getRenderedChunk(chunkId);
    if (!data) {
      return files;
    }

    if (includeChunkFile) {
      files.add(data.fileName);
    }

    data.viteMetadata.importedCss.forEach(files.add, files);
    data.viteMetadata.importedAssets.forEach(files.add, files);

    data.imports.forEach((chunkId) =>
      this.getWebAccessibleFilesForRenderedChunk(chunkId).forEach(
        files.add,
        files
      )
    );

    data.dynamicImports.forEach((chunkId) =>
      this.getWebAccessibleFilesForRenderedChunk(chunkId).forEach(
        files.add,
        files
      )
    );

    return files;
  }
}
