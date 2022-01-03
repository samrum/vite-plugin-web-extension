import { readFileSync } from "fs-extra";
import { ManifestChunk, ResolvedConfig } from "vite";
import DevBuilder from "../devBuilder/devBuilder";
import { getOutputFileName } from "../utils/file";
import type { Manifest as ViteManifest } from "vite";
import { EmittedFile, OutputBundle } from "rollup";
import { getContentScriptLoaderForManifestChunk } from "../utils/loader";

export interface ParseResult<Manifest extends chrome.runtime.Manifest> {
  inputScripts: [string, string][];
  emitFiles: EmittedFile[];
  manifest: Manifest;
}

export default abstract class ManifestParser<
  Manifest extends chrome.runtime.Manifest
> {
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

  async parseOutput(
    viteManifest: ViteManifest,
    outputBundle: OutputBundle
  ): Promise<ParseResult<Manifest>> {
    let result: ParseResult<Manifest> = {
      inputScripts: [],
      emitFiles: [],
      manifest: this.inputManifest,
    };

    result = await this.parseOutputContentScripts(
      result,
      viteManifest,
      outputBundle
    );

    for (const parseMethod of this.getParseOutputMethods()) {
      result = await parseMethod(result, viteManifest, outputBundle);
    }

    result.emitFiles.push({
      type: "asset",
      fileName: "manifest.json",
      source: JSON.stringify(result.manifest, null, 2),
    });

    return result;
  }

  protected abstract createDevBuilder(): DevBuilder<Manifest>;

  protected abstract getHtmlFileNames(manifest: Manifest): string[];

  protected abstract getParseInputMethods(): ((
    result: ParseResult<Manifest>
  ) => ParseResult<Manifest>)[];

  protected abstract getParseOutputMethods(): ((
    result: ParseResult<Manifest>,
    viteManifest: ViteManifest,
    outputBundle: OutputBundle
  ) => Promise<ParseResult<Manifest>>)[];

  protected abstract parseOutputContentScripts(
    result: ParseResult<Manifest>,
    viteManifest: ViteManifest,
    outputBundle: OutputBundle
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
        const outputFile = getOutputFileName(scriptFile);

        result.inputScripts.push([outputFile, scriptFile]);
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

    const outputFile = getOutputFileName(htmlFileName);

    result.inputScripts.push([outputFile, htmlFileName]);

    return result;
  }

  protected parseOutputContentScript(
    scriptFileName: string,
    result: ParseResult<Manifest>,
    viteManifest: ViteManifest,
    outputBundle: OutputBundle
  ): { scriptFileName: string; webAccessibleFiles: Set<string> } | null {
    const manifestChunk = viteManifest[scriptFileName];
    if (!manifestChunk) {
      return null;
    }

    const scriptLoaderFile =
      getContentScriptLoaderForManifestChunk(manifestChunk);

    if (scriptLoaderFile.source) {
      result.emitFiles.push({
        type: "asset",
        fileName: scriptLoaderFile.fileName,
        source: scriptLoaderFile.source,
      });
    }

    this.rewriteCssInBundleForManifestChunk(manifestChunk, outputBundle);

    return {
      scriptFileName: scriptLoaderFile.fileName,
      webAccessibleFiles: this.getWebAccessibleFilesForManifestChunk(
        viteManifest,
        scriptFileName,
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

  protected rewriteCssInBundleForManifestChunk(
    manifestChunk: ManifestChunk,
    outputBundle: OutputBundle
  ) {
    if (!manifestChunk.css?.length) {
      return;
    }

    const outputChunk = outputBundle[manifestChunk.file];
    if (outputChunk.type !== "chunk") {
      return;
    }

    outputChunk.code = outputChunk.code.replace(
      new RegExp(manifestChunk.file.replace(".js", ".css"), "g"),
      manifestChunk.css[0]
    );
  }

  private getWebAccessibleFilesForManifestChunk(
    viteManifest: ViteManifest,
    chunkId: string,
    includeChunkFile = true
  ): Set<string> {
    const files = new Set<string>();

    const manifestChunk = viteManifest[chunkId];
    if (!manifestChunk) {
      return files;
    }

    if (includeChunkFile) {
      files.add(manifestChunk.file);
    }

    manifestChunk.css?.forEach(files.add, files);
    manifestChunk.assets?.forEach(files.add, files);

    manifestChunk.imports?.forEach((chunkId) =>
      this.getWebAccessibleFilesForManifestChunk(viteManifest, chunkId).forEach(
        files.add,
        files
      )
    );

    manifestChunk.dynamicImports?.forEach((chunkId) =>
      this.getWebAccessibleFilesForManifestChunk(viteManifest, chunkId).forEach(
        files.add,
        files
      )
    );

    return files;
  }
}
