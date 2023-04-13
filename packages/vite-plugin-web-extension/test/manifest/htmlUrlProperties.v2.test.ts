import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("htmlUrlProperties");

runManifestV2Test("htmlUrlProperties", () => ({
  browser_action: {
    default_popup: `${resourceDir}/popup.html#hashValue`,
  },
  devtools_page: `${resourceDir}/devtools.html?query=1`,
  options_ui: {
    page: `${resourceDir}/options.html?query=1#hashValue`,
  },
}));
