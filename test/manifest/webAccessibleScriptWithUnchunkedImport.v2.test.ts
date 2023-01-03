import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("webAccessibleScriptWithUnchunkedImport");

runManifestV2Test("webAccessibleScriptWithUnchunkedImport", () => ({
  web_accessible_resources: [`${resourceDir}/webAccessibleScript.js`],
}));
