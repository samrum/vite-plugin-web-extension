import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("additionalInputsWebAccessible");

runManifestV3Test("additionalInputsWebAccessible", () => ({}), {
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
          extension_ids: ["oilkjaldkfjlasdf"],
        },
      },
      {
        fileName: `${resourceDir}/script6.js`,
        webAccessible: {
          matches: ["https://example.com/"],
          use_dynamic_url: true,
        },
      },
      {
        fileName: `${resourceDir}/chunkedScript1.js`,
        isEntryWebAccessible: false,
        webAccessible: {
          matches: ["https://example.com/"],
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
