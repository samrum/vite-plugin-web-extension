import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("sidePanelHtml");

runManifestV3Test("sidePanelHtml", () => ({
  side_panel: {
    default_path: `${resourceDir}/sidepanel.html`,
  },
}));
