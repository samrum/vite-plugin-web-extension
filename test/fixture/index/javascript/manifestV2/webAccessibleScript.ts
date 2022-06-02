import { getExpectedHtml, getExpectedLog } from "../../../fixtureUtils";
import { getExpectedCode } from "../shared/webAccessibleScript";

const resourceDir =
  "test/fixture/index/javascript/resources/webAccessibleScript";

const inputManifest = {
  web_accessible_resources: [`${resourceDir}/webAccessibleScript.js`],
};

const expectedManifest = {
  web_accessible_resources: [`${resourceDir}/webAccessibleScript.js`],
};

export default {
  inputManifest,
  expectedManifest,
  ...getExpectedCode(resourceDir),
};
