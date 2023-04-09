import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("contentScriptTypes");

runManifestV3Test("contentScriptTypes", () => ({
  content_scripts: [
    {
      js: [`${resourceDir}/content1.js`],
      matches: ["https://example.com/"],
    },
    {
      js: [`${resourceDir}/content2.ts`],
      matches: ["https://example.com/"],
    },
  ],
}));
