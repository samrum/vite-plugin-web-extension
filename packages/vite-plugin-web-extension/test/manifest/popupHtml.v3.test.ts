import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("popupHtml");

runManifestV3Test("popupHtml", () => ({
  action: {
    default_popup: `${resourceDir}/popup.html`,
  },
}));
