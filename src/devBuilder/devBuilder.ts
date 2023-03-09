import { copy, emptyDir, ensureDir, readFile, writeFile } from "fs-extra";
import path from "path";
import {
  ResolvedConfig,
  ViteDevServer,
  normalizePath,
  createFilter,
} from "vite";
import { getScriptLoaderFile } from "../utils/loader";
import { getInputFileName, getOutputFileName } from "../utils/file";
import { getVirtualModule } from "../utils/virtualModule";
import { addHmrSupportToCsp } from "../utils/addHmrSupportToCsp";
import { ViteWebExtensionOptions } from "../../types";
import { createWebAccessibleScriptsFilter } from "../utils/filter";

export default abstract class DevBuilder<
  Manifest extends chrome.runtime.Manifest
> {
  protected hmrServerOrigin = "";
  protected inlineScriptHashes = new Set<string>();
  protected outDir: string;
  protected webAccessibleScriptsFilter: ReturnType<typeof createFilter>;

  constructor(
    private viteConfig: ResolvedConfig,
    private pluginOptions: ViteWebExtensionOptions,
    private viteDevServer?: ViteDevServer
  ) {
    this.outDir = path.resolve(
      process.cwd(),
      this.viteConfig.root,
      this.viteConfig.build.outDir
    );

    this.webAccessibleScriptsFilter = createWebAccessibleScriptsFilter(
      this.pluginOptions.webAccessibleScripts
    );
  }

  async writeBuild({
    devServerPort,
    manifest,
    manifestHtmlFiles,
  }: {
    devServerPort: number;
    manifest: Manifest;
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
    await this.writeManifestContentScriptFiles(manifest);
    await this.writeManifestContentCssFiles(manifest);
    await this.writeManifestWebAccessibleScriptFiles(
      manifest,
      this.webAccessibleScriptsFilter
    );

    await this.writeBuildFiles(manifest, manifestHtmlFiles);

    this.updateContentSecurityPolicyForHmr(manifest);

    await writeFile(
      `${this.outDir}/manifest.json`,
      JSON.stringify(manifest, null, 2)
    );
  }

  protected abstract updateContentSecurityPolicyForHmr(
    manifest: Manifest
  ): Manifest;

  protected async writeBuildFiles(
    _manifest: Manifest,
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

  private async writeManifestHtmlFile(
    fileName: string,
    absoluteFileName: string
  ): Promise<void> {
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
  }

  protected parseInlineScriptHashes(_content: string): void {}

  protected async writeManifestContentScriptFiles(manifest: Manifest) {
    if (!manifest.content_scripts) {
      return;
    }

    for (const [
      contentScriptIndex,
      script,
    ] of manifest.content_scripts.entries()) {
      if (!script.js) {
        continue;
      }

      for (const [scriptJsIndex, fileName] of script.js.entries()) {
        const outputFileName = getOutputFileName(fileName);

        const scriptLoaderFile = getScriptLoaderFile(
          outputFileName,
          `${this.hmrServerOrigin}/${fileName}`
        );

        manifest.content_scripts[contentScriptIndex].js![scriptJsIndex] =
          scriptLoaderFile.fileName;

        const outFile = `${this.outDir}/${scriptLoaderFile.fileName}`;

        const outFileDir = path.dirname(outFile);

        await ensureDir(outFileDir);

        await writeFile(outFile, scriptLoaderFile.source);
      }
    }
  }

  protected async writeManifestContentCssFiles(manifest: Manifest) {
    if (!manifest.content_scripts) {
      return;
    }

    for (const [
      contentScriptIndex,
      script,
    ] of manifest.content_scripts.entries()) {
      if (!script.css) {
        continue;
      }

      for (const [cssIndex, fileName] of script.css.entries()) {
        const absoluteFileName = getInputFileName(
          fileName,
          this.viteConfig.root
        );

        const outputFileName = `${getOutputFileName(fileName)}.css`;

        manifest.content_scripts[contentScriptIndex].css![cssIndex] =
          outputFileName;

        await this.writeManifestContentCssFile(
          outputFileName,
          absoluteFileName
        );

        this.viteDevServer!.watcher.on("change", async (path) => {
          if (normalizePath(path) !== absoluteFileName) {
            return;
          }

          await this.writeManifestContentCssFile(outputFileName, fileName);
        });
      }
    }
  }

  protected async writeManifestContentCssFile(
    outputFileName: string,
    fileName: string
  ) {
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
  }

  protected abstract writeManifestWebAccessibleScriptFiles(
    manifest: Manifest,
    webAccessibleScriptsFilter: ReturnType<typeof createFilter>
  ): Promise<void>;

  private getHmrServerOrigin(devServerPort: number): string {
    if (typeof this.viteConfig.server.hmr! === "boolean") {
      throw new Error("Vite HMR is misconfigured");
    }

    return `http://${this.viteConfig.server.hmr!.host}:${devServerPort}`;
  }
}
