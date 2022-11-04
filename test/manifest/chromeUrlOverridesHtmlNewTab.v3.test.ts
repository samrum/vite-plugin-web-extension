import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("chromeUrlOverridesHtml");

runManifestV3Test("chromeUrlOverridesHtmlNewTab", () => ({
  chrome_url_overrides: {
    newtab: `${resourceDir}/newtab.html`,
  },
}));
