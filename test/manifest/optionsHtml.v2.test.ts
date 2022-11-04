import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("optionsHtml");

runManifestV2Test("optionsHtml", () => ({
  options_ui: {
    page: `${resourceDir}/options.html`,
  },
}));
