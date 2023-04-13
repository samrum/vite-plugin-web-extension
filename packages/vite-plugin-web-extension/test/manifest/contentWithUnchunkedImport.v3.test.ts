import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("contentWithUnchunkedImport");

runManifestV3Test("contentWithUnchunkedImport", () => ({
  content_scripts: [
    {
      js: [`${resourceDir}/content.js`],
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
