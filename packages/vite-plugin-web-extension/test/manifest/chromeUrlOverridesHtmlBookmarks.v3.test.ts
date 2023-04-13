import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("chromeUrlOverridesHtml");

runManifestV3Test("chromeUrlOverridesHtmlBookmarks", () => ({
  chrome_url_overrides: {
    bookmarks: `${resourceDir}/bookmarks.html`,
  },
}));
