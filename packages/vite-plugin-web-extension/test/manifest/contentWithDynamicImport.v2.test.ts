import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("contentWithDynamicImport");

runManifestV2Test("contentWithDynamicImport", () => ({
  content_scripts: [
    {
      js: [`${resourceDir}/content1.js`],
      matches: ["https://*/*", "http://*/*"],
    },
    {
      js: [`${resourceDir}/content2.js`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
}));
