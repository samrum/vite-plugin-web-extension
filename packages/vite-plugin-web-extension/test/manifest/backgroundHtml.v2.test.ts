import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("backgroundHtml");

runManifestV2Test("backgroundHtml", () => ({
  background: {
    page: `${resourceDir}/background.html`,
    persistent: false,
  },
}));
