import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("webAccessibleScriptWithChunkedImport");

runManifestV2Test("webAccessibleScriptWithChunkedImport", () => ({
  web_accessible_resources: [
    `${resourceDir}/webAccessibleScript1.js`,
    `${resourceDir}/webAccessibleScript2.js`,
  ],
}));
