import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("webAccessibleScriptWithChunkedImport");

runManifestV3Test("webAccessibleScriptWithChunkedImport", () => ({
  web_accessible_resources: [
    {
      resources: [`${resourceDir}/webAccessibleScript1.js`],
      matches: ["<all_urls>"],
    },
    {
      resources: [`${resourceDir}/webAccessibleScript2.js`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
}));
