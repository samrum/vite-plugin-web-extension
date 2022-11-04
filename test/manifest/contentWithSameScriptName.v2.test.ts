import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("contentWithSameScriptName");

runManifestV2Test("contentWithSameScriptName", () => ({
  content_scripts: [
    {
      js: [`${resourceDir}/content1/content.js`],
      matches: ["https://*/*", "http://*/*"],
    },
    {
      js: [`${resourceDir}/content2/content.js`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
}));
