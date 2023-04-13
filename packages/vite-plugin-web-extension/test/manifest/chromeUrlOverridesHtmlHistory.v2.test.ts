import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("chromeUrlOverridesHtml");

runManifestV2Test("chromeUrlOverridesHtmlHistory", () => ({
  chrome_url_overrides: {
    history: `${resourceDir}/history.html`,
  },
}));
