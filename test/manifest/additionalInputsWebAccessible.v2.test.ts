import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("additionalInputsWebAccessible");

runManifestV2Test("additionalInputsWebAccessible", () => ({}), {
  additionalInputs: {
    scripts: [
      `${resourceDir}/script1.js`,
      {
        fileName: `${resourceDir}/script2.js`,
        webAccessibleResource: false,
      },
      {
        fileName: `${resourceDir}/script3.js`,
        webAccessibleResource: true,
      },
      {
        fileName: `${resourceDir}/script4.js`,
        webAccessibleResource: {
          matches: ["https://example.com/"],
        },
      },
      {
        fileName: `${resourceDir}/script5.ts`,
        webAccessibleResource: {
          extension_ids: ["oilkjaldkfjlasdf"],
        },
      },
      {
        fileName: `${resourceDir}/script6.js`,
        webAccessibleResource: {
          matches: ["https://example.com/"],
          use_dynamic_url: true,
        },
      },
      {
        fileName: `${resourceDir}/chunkedScript1.js`,
        isEntryWebAccessible: false,
        webAccessibleResource: {
          matches: ["https://example.com/"],
        },
      },
      {
        fileName: `${resourceDir}/chunkedScript2.js`,
        webAccessibleResource: {
          matches: ["https://example.com/"],
        },
      },
    ],
  },
});
