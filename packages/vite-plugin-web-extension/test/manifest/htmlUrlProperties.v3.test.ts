import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("htmlUrlProperties");

runManifestV3Test("htmlUrlProperties", () => ({
  action: {
    default_popup: `${resourceDir}/popup.html#hashValue`,
  },
  devtools_page: `${resourceDir}/devtools.html?query=1`,
  options_ui: {
    page: `${resourceDir}/options.html?query=1#hashValue`,
  },
}));
