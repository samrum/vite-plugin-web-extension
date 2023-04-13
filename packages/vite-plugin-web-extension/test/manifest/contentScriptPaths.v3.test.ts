import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("contentWithChunkedImport");
const resourceDirRoot = `/${resourceDir}`;
const resourceDirRelative = `./${resourceDir}`;

runManifestV3Test("contentScriptPaths", () => ({
  content_scripts: [
    {
      js: [`${resourceDirRoot}/content1.js`],
      matches: ["https://*/*", "http://*/*"],
    },
    {
      js: [`${resourceDirRelative}/content2.js`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
}));
