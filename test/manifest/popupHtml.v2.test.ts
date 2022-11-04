import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("popupHtml");

runManifestV2Test("popupHtml", () => ({
  browser_action: {
    default_popup: `${resourceDir}/popup.html`,
  },
}));
