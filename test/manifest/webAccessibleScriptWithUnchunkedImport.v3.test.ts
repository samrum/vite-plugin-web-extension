import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("webAccessibleScriptWithUnchunkedImport");

runManifestV3Test("webAccessibleScriptWithUnchunkedImport", () => ({
  web_accessible_resources: [
    {
      resources: [`${resourceDir}/webAccessibleScript.js`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
}));
