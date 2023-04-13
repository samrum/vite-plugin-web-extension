import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("additionalInputsHtml");

runManifestV3Test("additionalInputsHtml", () => ({}), {
  additionalInputs: {
    html: [`${resourceDir}/html.html`],
  },
});
