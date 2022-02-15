import { copy, emptyDir, ensureDir, readFile, writeFile } from "fs-extra";
import path from "path";
import { ResolvedConfig, ViteDevServer } from "vite";
import { getContentScriptLoaderFile } from "../utils/loader";
import { getInputFileName, getOutputFileName } from "../utils/file";
import { getVirtualModule } from "../utils/virtualModule";

export default abstract class DevBuilder<
  Manifest extends chrome.runtime.Manifest
> {
  protected hmrServerOrigin = "";
  protected inlineScriptHashes = new Set<string>();
  protected outDir: string;

  constructor(
    private viteConfig: ResolvedConfig,
    private viteDevServer?: ViteDevServer
  ) {
    this.outDir = this.viteConfig.build.outDir;
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
    copy("public", this.outDir);

    await this.writeManifestHtmlFiles(manifestHtmlFiles);
    await this.writeManifestContentScriptFiles(manifest);

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
    const scriptSrcs = [
      [...this.inlineScriptHashes].join(" "),
      this.hmrServerOrigin,
    ];

    const cspHmrScriptSrc = `script-src ${scriptSrcs.join(
      " "
    )}; object-src 'self'`;

    if (!contentSecurityPolicy) {
      return cspHmrScriptSrc;
    }

    if (contentSecurityPolicy.includes("script-src")) {
      return contentSecurityPolicy.replace(`script-src`, cspHmrScriptSrc);
    }

    return (contentSecurityPolicy += `; ${cspHmrScriptSrc}`);
  }

  protected async writeManifestHtmlFiles(htmlFileNames: string[]) {
    for (const fileName of htmlFileNames) {
      const absoluteFileName = getInputFileName(fileName, this.viteConfig.root);

      await this.writeManifestHtmlFile(fileName, absoluteFileName);

      this.viteDevServer!.watcher.on("change", async (path) => {
        if (path !== absoluteFileName) {
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

    // apply plugin transforms
    content = await this.viteDevServer!.transformIndexHtml(fileName, content);

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

        const scriptLoaderFile = getContentScriptLoaderFile(
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

  private getHmrServerOrigin(devServerPort: number): string {
    if (typeof this.viteConfig.server.hmr! === "boolean") {
      throw new Error("Vite HMR is misconfigured");
    }

    return `http://${this.viteConfig.server.hmr!.host}:${devServerPort}`;
  }
}
