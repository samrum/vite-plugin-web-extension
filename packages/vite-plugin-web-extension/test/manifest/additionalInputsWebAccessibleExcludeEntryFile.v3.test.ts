import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("additionalInputsWebAccessible");

runManifestV3Test("additionalInputsWebAccessible", () => ({}), {
  additionalInputs: {
    scripts: [
      `${resourceDir}/script1.js`,
      {
        fileName: `${resourceDir}/script2.js`,
        webAccessible: {
          matches: ["https://example.com/"],
        },
      },
      {
        fileName: `${resourceDir}/script3.js`,
        webAccessible: {
          matches: ["https://example.com/"],
          excludeEntryFile: false,
        },
      },
      {
        fileName: `${resourceDir}/script4.js`,
        webAccessible: {
          matches: ["https://example.com/"],
          excludeEntryFile: true,
        },
      },
      {
        fileName: `${resourceDir}/script5.ts`,
        webAccessible: {
          extensionIds: ["oilkjaldkfjlasdf"],
        },
      },
      {
        fileName: `${resourceDir}/script6.js`,
        webAccessible: {
          extensionIds: ["oilkjaldkfjlasdf"],
          excludeEntryFile: false,
        },
      },
      {
        fileName: `${resourceDir}/script7.js`,
        webAccessible: {
          extensionIds: ["oilkjaldkfjlasdf"],
          excludeEntryFile: true,
        },
      },
      {
        fileName: `${resourceDir}/chunkedScript1.js`,
        webAccessible: {
          matches: ["https://example.com/"],
        },
      },
      {
        fileName: `${resourceDir}/chunkedScript2.js`,
        webAccessible: {
          matches: ["https://example.com/"],
          excludeEntryFile: false,
        },
      },
      {
        fileName: `${resourceDir}/chunkedScript3.js`,
        webAccessible: {
          matches: ["https://example.com/"],
          excludeEntryFile: true,
        },
      },
    ],
  },
});
