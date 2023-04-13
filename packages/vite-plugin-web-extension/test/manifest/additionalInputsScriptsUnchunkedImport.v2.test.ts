import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("additionalInputsScriptsUnchunkedImport");

runManifestV2Test("additionalInputsScriptsUnchunkedImport", () => ({}), {
  additionalInputs: {
    scripts: [`${resourceDir}/script1.js`, `${resourceDir}/script2.js`],
  },
});
