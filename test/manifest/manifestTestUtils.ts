import path from "path";
import { expect, test } from "vitest";
import { build, normalizePath } from "vite";
import type { RollupOutput } from "rollup";
import webExtension from "../../src/index";

type InputManifestGenerator<ManifestType> = () => Partial<ManifestType>;

function normalizeFileName(fileName: string): string {
  return normalizePath(path.normalize(fileName));
}

async function bundleGenerate(
  manifest: chrome.runtime.Manifest
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
    plugins: [
      webExtension({
        manifest,
      }),
    ],
  });

  return bundle as RollupOutput;
}

export async function runTest<ManifestType extends chrome.runtime.Manifest>(
  inputManifestGenerator: InputManifestGenerator<ManifestType>,
  manifestVersion: ManifestType["manifest_version"]
): Promise<void> {
  const [repoDir] = __dirname.split("/test/manifest");

  const baseManifest: chrome.runtime.Manifest = {
    version: "1.0.0",
    name: "Manifest Name",
    manifest_version: manifestVersion,
  };

  let { output } = await bundleGenerate({
    ...baseManifest,
    ...inputManifestGenerator(),
  });

  expect(
    output.map((file) => {
      if (file.type === "chunk") {
        const modules = {};
        for (const [key, value] of Object.entries(file.modules)) {
          modules[key.replace(repoDir, "/mocked-repo-dir")] = value;
        }

        return {
          code: file.code,
          dynamicImports: file.dynamicImports,
          exports: file.exports,
          facadeModuleId:
            file.facadeModuleId?.replace(repoDir, "/mocked-repo-dir") ?? null,
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
  ).toMatchSnapshot();
}

export function getResourceDir(path: string): string {
  return `test/manifest/resources/${path}`;
}

export async function runManifestV2Test(
  testName: string,
  manifestGenerator: InputManifestGenerator<chrome.runtime.ManifestV2>
) {
  test(`${testName} - Manifest V2`, async () => {
    await runTest(manifestGenerator, 2);
  });
}

export async function runManifestV3Test(
  testName: string,
  manifestGenerator: InputManifestGenerator<chrome.runtime.ManifestV3>
) {
  test(`${testName} - Manifest V3`, async () => {
    await runTest(manifestGenerator, 3);
  });
}
