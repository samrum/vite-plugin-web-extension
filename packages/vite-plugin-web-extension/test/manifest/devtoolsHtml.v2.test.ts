import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("devtoolsHtml");

runManifestV2Test("devtoolsHtml", () => ({
  devtools_page: `${resourceDir}/devtools.html`,
}));
