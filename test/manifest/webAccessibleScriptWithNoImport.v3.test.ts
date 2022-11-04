import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("webAccessibleScriptWithNoImport");

runManifestV3Test("webAccessibleScriptWithNoImport", () => ({
  web_accessible_resources: [
    {
      resources: [`${resourceDir}/webAccessibleScript.js`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
}));
