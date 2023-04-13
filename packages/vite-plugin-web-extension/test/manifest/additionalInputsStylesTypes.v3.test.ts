import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("additionalInputsStylesTypes");

runManifestV3Test("additionalInputsStylesTypes", () => ({}), {
  additionalInputs: {
    styles: [`${resourceDir}/style1.css`, `${resourceDir}/style2.scss`],
  },
});
