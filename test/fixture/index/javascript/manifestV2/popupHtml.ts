import { getExpectedHtml, getExpectedLog } from "../../../fixtureUtils";
import { getExpectedCode } from "../shared/popupHtml";

const resourceDir = "test/fixture/index/javascript/resources/popupHtml";

const inputManifest = {
  browser_action: {
    default_popup: `${resourceDir}/popup.html`,
  },
};

const expectedManifest = {
  browser_action: {
    default_popup: `${resourceDir}/popup.html`,
  },
};

export default {
  inputManifest,
  expectedManifest,
  ...getExpectedCode(resourceDir),
};
