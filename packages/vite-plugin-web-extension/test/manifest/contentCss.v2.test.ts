import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("contentCss");

runManifestV2Test("contentCss", () => ({
  content_scripts: [
    {
      js: [`${resourceDir}/content.js`],
      css: [`${resourceDir}/content1.css`, `${resourceDir}/content2.scss`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
}));
