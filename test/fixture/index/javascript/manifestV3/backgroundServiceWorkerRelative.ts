const resourceDir =
  "test/fixture/index/javascript/resources/backgroundServiceWorker";
const resourceDirRelative = `./${resourceDir}`;

const inputManifest = {
  background: {
    service_worker: `${resourceDirRelative}/serviceWorker.js`,
  },
};

const expectedManifest: Partial<chrome.runtime.ManifestV3> = {
  background: {
    service_worker: `serviceWorker.js`,
    type: "module",
  },
};

const chunkCode = {
  [`assets/${resourceDir}/serviceWorker.js`]: `console.log("serviceWorker");\n`,
};

const assetCode = {
  ["serviceWorker.js"]: `import "/assets/${resourceDir}/serviceWorker.js";`,
};

export default {
  inputManifest,
  expectedManifest,
  chunkCode,
  assetCode,
};
