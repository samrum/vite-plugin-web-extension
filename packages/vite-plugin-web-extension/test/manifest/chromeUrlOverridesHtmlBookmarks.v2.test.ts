import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("chromeUrlOverridesHtml");

runManifestV2Test("chromeUrlOverridesHtmlBookmarks", () => ({
  chrome_url_overrides: {
    bookmarks: `${resourceDir}/bookmarks.html`,
  },
}));
