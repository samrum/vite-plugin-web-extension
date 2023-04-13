import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("backgroundServiceWorker");
const resourceDirRelative = `./${resourceDir}`;

runManifestV3Test("backgroundServiceWorker", () => ({
  background: {
    service_worker: `${resourceDirRelative}/serviceWorker.js`,
  },
}));
