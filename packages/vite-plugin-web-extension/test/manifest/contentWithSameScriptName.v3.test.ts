import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("contentWithSameScriptName");

runManifestV3Test("contentWithSameScriptName", () => ({
  content_scripts: [
    {
      js: [`${resourceDir}/content1/content.js`],
      matches: [
        "*://*/*",
        "https://*/*",
        "*://example.com/",
        "https://example.com/",
        "*://example.com/subpath/*",
        "https://example.com/subpath/*",
      ],
    },
    {
      js: [`${resourceDir}/content2/content.js`],
      matches: [
        "*://*/*",
        "https://*/*",
        "*://example.com/",
        "https://example.com/",
        "*://example.com/subpath/*",
        "https://example.com/subpath/*",
      ],
    },
  ],
}));
