import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("chromeUrlOverridesHtml");

runManifestV2Test("chromeUrlOverridesHtmlNewTab", () => ({
  chrome_url_overrides: {
    newtab: `${resourceDir}/newtab.html`,
  },
}));
