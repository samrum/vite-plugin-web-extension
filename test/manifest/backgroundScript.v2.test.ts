import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("backgroundScript");

runManifestV2Test("backgroundScript", () => ({
  background: {
    scripts: [`/${resourceDir}/background.js`],
    persistent: false,
  },
}));
