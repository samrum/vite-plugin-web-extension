import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("useDynamicUrlWebAccessibleResources");

runManifestV3Test(
  "useDynamicUrlWebAccessibleResourcesEnabled",
  () => ({
    content_scripts: [
      {
        js: [`${resourceDir}/content1.js`],
        matches: ["<all_urls>"],
      },
      {
        js: [`${resourceDir}/content2.js`],
        matches: ["<all_urls>"],
      },
    ],
  }),
  {
    additionalInputs: {
      scripts: [`${resourceDir}/script1.js`, `${resourceDir}/script2.js`],
    },
  }
);
