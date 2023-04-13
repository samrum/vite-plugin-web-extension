import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("contentWithUnchunkedImport");

runManifestV2Test("contentWithUnchunkedImport", () => ({
  content_scripts: [
    {
      js: [`${resourceDir}/content.js`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
}));
