import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("chromeUrlOverridesHtml");

runManifestV3Test("chromeUrlOverridesHtmlHistory", () => ({
  chrome_url_overrides: {
    history: `${resourceDir}/history.html`,
  },
}));
