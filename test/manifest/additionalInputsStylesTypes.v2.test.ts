import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("additionalInputsStylesTypes");

runManifestV2Test("additionalInputsStylesTypes", () => ({}), {
  additionalInputs: {
    styles: [`${resourceDir}/style1.css`, `${resourceDir}/style2.scss`],
  },
});
