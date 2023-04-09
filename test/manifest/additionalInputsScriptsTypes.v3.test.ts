import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("additionalInputsScriptsTypes");

runManifestV3Test("additionalInputsScriptsTypes", () => ({}), {
  additionalInputs: {
    scripts: [`${resourceDir}/script1.js`, `${resourceDir}/script2.ts`],
  },
});
