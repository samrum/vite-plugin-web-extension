import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("chunkCssRewrite");

runManifestV3Test("chunkCssRewrite", () => ({
  content_scripts: [
    {
      js: [`${resourceDir}/content1.js`],
      matches: ["https://*/*", "http://*/*"],
    },
    {
      js: [`${resourceDir}/content2.js`],
      matches: ["https://*/*", "http://*/*"],
    },
    {
      js: [`${resourceDir}/contentNoCss.js`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
}));
