import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("additionalInputsScriptsNoImport");

runManifestV2Test("additionalInputsScriptsNoImport", () => ({}), {
  additionalInputs: {
    scripts: [`${resourceDir}/script1.js`, `${resourceDir}/script2.js`],
  },
});
