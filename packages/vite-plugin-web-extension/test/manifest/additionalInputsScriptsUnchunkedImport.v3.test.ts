import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("additionalInputsScriptsUnchunkedImport");

runManifestV3Test("additionalInputsScriptsUnchunkedImport", () => ({}), {
  additionalInputs: {
    scripts: [`${resourceDir}/script1.js`, `${resourceDir}/script2.js`],
  },
});
