import { test, expect } from "vitest";
import { build, normalizePath } from "vite";
import type { RollupOutput } from "rollup";
import webExtension from "../../src/index";

interface TestFixture<ManifestType> {
  inputManifest: Partial<ManifestType>;
  expectedManifest: Partial<ManifestType>;
  assetCode?: { [entryAlias: string]: string };
  chunkCode?: { [entryAlias: string]: string };
}

async function bundleGenerate(
  manifest: chrome.runtime.Manifest
): Promise<RollupOutput> {
  const bundle = await build({
    logLevel: "warn",
    build: {
      write: false,
      minify: false,
      polyfillModulePreload: false,
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

async function validateFixture<ManifestType extends chrome.runtime.Manifest>(
  {
    inputManifest,
    expectedManifest,
    assetCode = {},
    chunkCode = {},
  }: TestFixture<ManifestType>,
  manifestVersion: ManifestType["manifest_version"]
): Promise<void> {
  const baseManifest: chrome.runtime.Manifest = {
    version: "1.0.0",
    name: "Manifest Name",
    manifest_version: manifestVersion,
  };

  let { output } = await bundleGenerate({
    ...baseManifest,
    ...inputManifest,
  });

  assetCode = {
    "manifest.json": JSON.stringify(
      { ...baseManifest, ...expectedManifest },
      null,
      2
    ),
    ...assetCode,
  };

  const numberOfOutputFiles = output.length;
  const numberOfExpectedFiles =
    Object.keys(chunkCode).length + Object.keys(assetCode).length;

  output.forEach((file) => {
    const outputFileName = normalizePath(file.fileName);

    if (file.type === "chunk") {
      if (["assets/preload-helper.js"].includes(outputFileName)) {
        delete chunkCode[outputFileName];
        return;
      }

      if (!chunkCode[outputFileName]) {
        throw new Error(
          `Missing expected output chunk definition for: ${outputFileName}`
        );
      }

      expect(file.code).toEqual(chunkCode[outputFileName]);
      delete chunkCode[outputFileName];
    } else {
      if (!assetCode[outputFileName]) {
        throw new Error(
          `Missing expected output asset definition for: ${outputFileName}`
        );
      }

      expect(
        typeof file.source === "string"
          ? file.source
          : JSON.stringify(file.source)
      ).toEqual(assetCode[outputFileName]);
      delete assetCode[outputFileName];
    }
  });

  expect(Object.keys(chunkCode)).toEqual([]);
  expect(Object.keys(assetCode)).toEqual([]);

  // Number of output files should match expected output files defined in fixture
  expect(numberOfOutputFiles).toEqual(numberOfExpectedFiles);
}

export async function validateManifestV2Fixtures(fixtures: {
  [key: string]: TestFixture<chrome.runtime.ManifestV2>;
}) {
  Object.entries(fixtures).forEach(([testName, fixture]) => {
    test(testName, async () => {
      await validateFixture(fixture, 2);
    });
  });
}

export async function validateManifestV3Fixtures(fixtures: {
  [key: string]: TestFixture<chrome.runtime.ManifestV3>;
}) {
  Object.entries(fixtures).forEach(([testName, fixture]) => {
    test(testName, async () => {
      await validateFixture(fixture, 3);
    });
  });
}
