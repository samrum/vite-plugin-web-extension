import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("additionalInputsWebAccessible");

runManifestV2Test("additionalInputsWebAccessible", () => ({}), {
  additionalInputs: {
    scripts: [
      `${resourceDir}/script1.js`,
      {
        fileName: `${resourceDir}/script2.js`,
        webAccessible: false,
      },
      {
        fileName: `${resourceDir}/script3.js`,
        webAccessible: true,
      },
      {
        fileName: `${resourceDir}/script4.js`,
        webAccessible: {
          matches: ["https://example.com/"],
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
          includeEntryFile: true,
        },
      },
      {
        fileName: `${resourceDir}/chunkedScript1.js`,
        webAccessible: {
          matches: ["https://example.com/"],
          includeEntryFile: true,
        },
      },
      {
        fileName: `${resourceDir}/chunkedScript2.js`,
        webAccessible: {
          matches: ["https://example.com/"],
        },
      },
    ],
  },
});
