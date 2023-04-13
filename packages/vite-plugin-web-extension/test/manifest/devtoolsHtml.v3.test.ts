import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("devtoolsHtml");

runManifestV3Test("devtoolsHtml", () => ({
  devtools_page: `${resourceDir}/devtools.html`,
}));
