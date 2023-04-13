import path from "path";
import { expect, test } from "vitest";
import { build, normalizePath } from "vite";
import type { RollupOutput } from "rollup";
import webExtension from "../../src/index";
import { ViteWebExtensionOptions } from "../../types";

type InputManifestGenerator<ManifestType> = () => Partial<ManifestType>;

function normalizeFileName(fileName: string): string {
  return normalizePath(path.normalize(fileName));
}

async function bundleGenerate(
  options: ViteWebExtensionOptions
): Promise<RollupOutput> {
  const bundle = await build({
    logLevel: "warn",
    build: {
      write: false,
      minify: false,
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`,
        },
      },
    },
    plugins: [webExtension(options)],
  });

  return bundle as RollupOutput;
}

function trimFilePathToRepoDirectory(filePath: string): string {
  return filePath.substring(filePath.lastIndexOf("vite-plugin-web-extension"));
}

export async function runTest<ManifestType extends chrome.runtime.Manifest>({
  manifestGenerator,
  manifestVersion,
  pluginOptions,
}: {
  manifestVersion: ManifestType["manifest_version"];
  manifestGenerator: InputManifestGenerator<ManifestType>;
  pluginOptions: Partial<ViteWebExtensionOptions>;
}): Promise<void> {
  const [repoDir] = __dirname.split("/test/manifest");

  const baseManifest: chrome.runtime.Manifest = {
    version: "1.0.0",
    name: "Manifest Name",
    manifest_version: manifestVersion,
  };

  let { output } = await bundleGenerate({
    manifest: {
      ...baseManifest,
      ...manifestGenerator(),
    },
    ...pluginOptions,
  });

  expect(
    output
      .map((file) => {
        if (file.type === "chunk") {
          const modules = {};
          for (const [key, value] of Object.entries(file.modules)) {
            modules[trimFilePathToRepoDirectory(key)] = value;
          }

          return {
            code: file.code,
            dynamicImports: file.dynamicImports,
            exports: file.exports,
            facadeModuleId: file.facadeModuleId
              ? trimFilePathToRepoDirectory(file.facadeModuleId)
              : null,
            fileName: normalizeFileName(file.fileName),
            implicitlyLoadedBefore: file.implicitlyLoadedBefore,
            importedBindings: file.importedBindings,
            imports: file.imports,
            isDynamicEntry: file.isDynamicEntry,
            isEntry: file.isEntry,
            isImplicitEntry: file.isImplicitEntry,
            map: file.map,
            modules: modules,
            name: normalizeFileName(file.name),
            referencedFiles: file.referencedFiles,
            type: file.type,
            viteMetadata: file.viteMetadata,
          };
        }

        if (file.type === "asset") {
          return {
            fileName: normalizeFileName(file.fileName),
            name:
              typeof file.name === "undefined"
                ? undefined
                : normalizeFileName(file.name),
            source: file.source,
            type: file.type,
          };
        }

        return file;
      })
      .sort((a, b) => a.fileName.localeCompare(b.fileName))
  ).toMatchSnapshot();
}

export function getResourceDir(path: string): string {
  return `test/manifest/resources/${path}`;
}

export async function runManifestV2Test(
  testName: string,
  manifestGenerator: InputManifestGenerator<chrome.runtime.ManifestV2>,
  pluginOptions: Partial<ViteWebExtensionOptions> = {}
) {
  test(`${testName} - Manifest V2`, async () => {
    await runTest({
      manifestVersion: 2,
      manifestGenerator,
      pluginOptions,
    });
  });
}

export async function runManifestV3Test(
  testName: string,
  manifestGenerator: InputManifestGenerator<chrome.runtime.ManifestV3>,
  pluginOptions: Partial<ViteWebExtensionOptions> = {}
) {
  test(`${testName} - Manifest V3`, async () => {
    await runTest({
      manifestVersion: 3,
      manifestGenerator,
      pluginOptions,
    });
  });
}
