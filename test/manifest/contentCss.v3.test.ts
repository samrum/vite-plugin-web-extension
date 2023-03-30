import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("contentCss");

runManifestV3Test("contentCss", () => ({
  content_scripts: [
    {
      js: [`${resourceDir}/content.js`],
      css: [`${resourceDir}/content1.css`, `${resourceDir}/content2.scss`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
}));
