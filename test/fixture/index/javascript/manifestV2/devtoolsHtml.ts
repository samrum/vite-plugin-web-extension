import { getExpectedCode } from "../shared/devtoolsHtml";

const resourceDir = "test/fixture/index/javascript/resources/devtoolsHtml";

const inputManifest = {
  devtools_page: `${resourceDir}/devtools.html`,
};

const expectedManifest = {
  devtools_page: `${resourceDir}/devtools.html`,
};

export default {
  inputManifest,
  expectedManifest,
  ...getExpectedCode(resourceDir),
};
