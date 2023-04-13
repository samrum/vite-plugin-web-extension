import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("optionsHtml");

runManifestV3Test("optionsHtml", () => ({
  options_ui: {
    page: `${resourceDir}/options.html`,
  },
}));
