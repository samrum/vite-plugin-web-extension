import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("contentWithNoImports");

runManifestV2Test("contentWithNoImports", () => ({
  content_scripts: [
    {
      js: [`${resourceDir}/content.js`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
}));
