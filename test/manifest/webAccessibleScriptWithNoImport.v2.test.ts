import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("webAccessibleScriptWithNoImport");

runManifestV2Test("webAccessibleScriptWithNoImport", () => ({
  web_accessible_resources: [`${resourceDir}/webAccessibleScript.js`],
}));
