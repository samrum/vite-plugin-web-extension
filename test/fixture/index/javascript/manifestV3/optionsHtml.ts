import { getExpectedHtml, getExpectedLog } from "../../../fixtureUtils";
import { getExpectedCode } from "../shared/optionsHtml";

const resourceDir = "test/fixture/index/javascript/resources/optionsHtml";

const inputManifest = {
  options_ui: {
    page: `${resourceDir}/options.html`,
  },
};

const expectedManifest = {
  options_ui: {
    page: `${resourceDir}/options.html`,
  },
};

export default {
  inputManifest,
  expectedManifest,
  ...getExpectedCode(resourceDir),
};
