import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("backgroundServiceWorker");

runManifestV3Test("backgroundServiceWorker", () => ({
  background: {
    service_worker: `${resourceDir}/serviceWorker.js`,
  },
}));
