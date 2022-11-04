import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("backgroundServiceWorker");
const resourceDirRoot = `/${resourceDir}`;

runManifestV3Test("backgroundServiceWorker", () => ({
  background: {
    service_worker: `${resourceDirRoot}/serviceWorker.js`,
  },
}));
