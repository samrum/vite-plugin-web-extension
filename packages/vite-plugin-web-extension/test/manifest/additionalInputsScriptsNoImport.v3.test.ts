import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("additionalInputsScriptsNoImport");

runManifestV3Test("additionalInputsScriptsNoImport", () => ({}), {
  additionalInputs: {
    scripts: [`${resourceDir}/script1.js`, `${resourceDir}/script2.js`],
  },
});
