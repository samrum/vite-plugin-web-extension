import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("additionalInputsHtml");

runManifestV2Test("additionalInputsHtml", () => ({}), {
  additionalInputs: {
    html: [`${resourceDir}/html.html`],
  },
});
