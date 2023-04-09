import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("additionalInputsScriptsChunkedImport");

runManifestV2Test("additionalInputsScriptsChunkedImport", () => ({}), {
  additionalInputs: {
    scripts: [`${resourceDir}/script1.js`, `${resourceDir}/script2.js`],
  },
});
