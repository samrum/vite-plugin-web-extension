import { copy, emptyDir, ensureDir, readFile, writeFile } from "fs-extra";
import path from "path";
import { ResolvedConfig, ViteDevServer, normalizePath } from "vite";
import { getScriptLoaderFile } from "../utils/loader";
import { getInputFileName, getOutputFileName } from "../utils/file";
import { getVirtualModule } from "../utils/virtualModule";
import { addHmrSupportToCsp } from "../utils/addHmrSupportToCsp";
import { AdditionalInput, ViteWebExtensionOptions } from "../../types";
import getAdditionalInputAsWebAccessibleResource from "../utils/getAdditionalInputAsWebAccessibleResource";
import getNormalizedAdditionalInput from "../utils/getNormalizedAdditionalInput";

export default abstract class DevBuilder<
  Manifest extends chrome.runtime.Manifest
> {
  protected hmrServerOrigin = "";
  protected inlineScriptHashes = new Set<string>();
  protected outDir: string;

  constructor(
    protected viteConfig: ResolvedConfig,
    protected pluginOptions: ViteWebExtensionOptions,
    private viteDevServer: ViteDevServer | undefined,
    protected manifest: Manifest
  ) {
    this.outDir = path.resolve(
      process.cwd(),
      this.viteConfig.root,
      this.viteConfig.build.outDir
    );
  }

  protected abstract updateContentSecurityPolicyForHmr(): void;

  protected abstract writeManifestAdditionalInputFiles(): Promise<void>;

  protected abstract addWebAccessibleResource({
    fileName,
    webAccessibleResource,
  }: {
    fileName: string;
    webAccessibleResource: {
      matches: string[] | undefined;
      extension_ids: string[] | undefined;
      use_dynamic_url?: boolean;
    };
  }): void;

  async writeBuild({
    devServerPort,
    manifestHtmlFiles,
  }: {
    devServerPort: number;
    manifestHtmlFiles: string[];
  }) {
    this.hmrServerOrigin = this.getHmrServerOrigin(devServerPort);

    await emptyDir(this.outDir);
    const publicDir = path.resolve(
      process.cwd(),
      this.viteConfig.root,
      this.viteConfig.publicDir
    );
    copy(publicDir, this.outDir);

    await this.writeManifestHtmlFiles(manifestHtmlFiles);
    await this.writeManifestContentScriptFiles();
    await this.writeManifestContentCssFiles();
    await this.writeManifestAdditionalInputFiles();

    await this.writeBuildFiles(manifestHtmlFiles);

    this.updateContentSecurityPolicyForHmr();

    await writeFile(
      `${this.outDir}/manifest.json`,
      JSON.stringify(this.manifest, null, 2)
    );
  }

  protected async writeBuildFiles(
    _manifestHtmlFiles: string[]
  ): Promise<void> {}

  protected getContentSecurityPolicyWithHmrSupport(
    contentSecurityPolicy: string | undefined
  ): string {
    return addHmrSupportToCsp(
      this.hmrServerOrigin,
      this.inlineScriptHashes,
      contentSecurityPolicy
    );
  }

  protected async writeManifestHtmlFiles(htmlFileNames: string[]) {
    for (const fileName of htmlFileNames) {
      const absoluteFileName = getInputFileName(fileName, this.viteConfig.root);

      await this.writeManifestHtmlFile(fileName, absoluteFileName);

      this.viteDevServer!.watcher.on("change", async (path) => {
        if (normalizePath(path) !== absoluteFileName) {
          return;
        }

        await this.writeManifestHtmlFile(fileName, absoluteFileName);
      });
    }
  }

  protected async writeManifestHtmlFile(
    fileName: string,
    absoluteFileName: string
  ): Promise<string> {
    let content =
      getVirtualModule(absoluteFileName) ??
      (await readFile(absoluteFileName, {
        encoding: "utf-8",
      }));

    if (this.pluginOptions.devHtmlTransform) {
      // apply plugin transforms
      content = await this.viteDevServer!.transformIndexHtml(fileName, content);
    }

    // update root paths
    content = content.replace(/src="\//g, `src="${this.hmrServerOrigin}/`);
    content = content.replace(/from "\//g, `from "${this.hmrServerOrigin}/`);

    // update relative paths
    const inputFileDir = path.dirname(fileName);
    content = content.replace(
      /src="\.\//g,
      `src="${this.hmrServerOrigin}/${inputFileDir ? `${inputFileDir}/` : ""}`
    );

    this.parseInlineScriptHashes(content);

    const outFile = `${this.outDir}/${fileName}`;

    const outFileDir = path.dirname(outFile);

    await ensureDir(outFileDir);

    await writeFile(outFile, content);

    return fileName;
  }

  protected parseInlineScriptHashes(_content: string): void {}

  protected async writeManifestContentScriptFiles() {
    if (!this.manifest.content_scripts) {
      return;
    }

    for (const [
      contentScriptIndex,
      script,
    ] of this.manifest.content_scripts.entries()) {
      if (!script.js) {
        continue;
      }

      for (const [scriptJsIndex, fileName] of script.js.entries()) {
        const loaderFileName = await this.writeManifestScriptFile(fileName);

        this.manifest.content_scripts[contentScriptIndex].js![scriptJsIndex] =
          loaderFileName;
      }
    }
  }

  protected async writeManifestScriptFile(fileName: string): Promise<string> {
    const outputFileName = getOutputFileName(fileName);

    const scriptLoaderFile = getScriptLoaderFile(
      outputFileName,
      `${this.hmrServerOrigin}/${fileName}`
    );

    const outFile = `${this.outDir}/${scriptLoaderFile.fileName}`;

    const outFileDir = path.dirname(outFile);

    await ensureDir(outFileDir);

    await writeFile(outFile, scriptLoaderFile.source);

    return scriptLoaderFile.fileName;
  }

  protected async writeManifestContentCssFiles() {
    if (!this.manifest.content_scripts) {
      return;
    }

    for (const [
      contentScriptIndex,
      script,
    ] of this.manifest.content_scripts.entries()) {
      if (!script.css) {
        continue;
      }

      for (const [cssIndex, fileName] of script.css.entries()) {
        const absoluteFileName = getInputFileName(
          fileName,
          this.viteConfig.root
        );

        const outputFileName = `${getOutputFileName(fileName)}.css`;

        this.manifest.content_scripts[contentScriptIndex].css![cssIndex] =
          outputFileName;

        await this.writeManifestAssetFile(outputFileName, absoluteFileName);

        this.viteDevServer!.watcher.on("change", async (path) => {
          if (normalizePath(path) !== absoluteFileName) {
            return;
          }

          await this.writeManifestAssetFile(outputFileName, fileName);
        });
      }
    }
  }

  protected async writeManifestAssetFile(
    outputFileName: string,
    fileName: string
  ): Promise<string> {
    const { default: source } = (await this.viteDevServer!.ssrLoadModule(
      fileName
    )) as { default: string };

    const loaderFile = {
      fileName: outputFileName,
      source,
    };

    const outFile = `${this.outDir}/${loaderFile.fileName}`;

    const outFileDir = path.dirname(outFile);

    await ensureDir(outFileDir);

    await writeFile(outFile, loaderFile.source);

    return loaderFile.fileName;
  }

  protected async writeManifestAdditionalInputFile(
    type: keyof NonNullable<ViteWebExtensionOptions["additionalInputs"]>,
    input: AdditionalInput
  ): Promise<void> {
    const additionalInput = getNormalizedAdditionalInput(input);
    const { fileName, webAccessible } = additionalInput;

    const absoluteFileName = getInputFileName(fileName, this.viteConfig.root);

    let outputFileName = "";

    switch (type) {
      case "html":
        outputFileName = await this.writeManifestHtmlFile(
          fileName,
          absoluteFileName
        );
        break;
      case "scripts":
        outputFileName = await this.writeManifestScriptFile(fileName);
        break;
      case "styles":
        const cssFileName = `${getOutputFileName(fileName)}.css`;
        outputFileName = await this.writeManifestAssetFile(
          cssFileName,
          absoluteFileName
        );
        break;
      default:
        throw new Error(`Invalid additionalInput type of ${type}`);
    }

    if (webAccessible?.includeEntryFile) {
      const webAccessibleResource =
        getAdditionalInputAsWebAccessibleResource(additionalInput);

      if (webAccessibleResource) {
        this.addWebAccessibleResource({
          fileName: outputFileName,
          webAccessibleResource,
        });
      }
    }
  }

  private getHmrServerOrigin(devServerPort: number): string {
    if (typeof this.viteConfig.server.hmr! === "boolean") {
      throw new Error("Vite HMR is misconfigured");
    }

    return `http://${this.viteConfig.server.hmr!.host}:${devServerPort}`;
  }
}
