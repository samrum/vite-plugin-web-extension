import { getExpectedCode } from "../shared/webAccessibleScriptWithNoImport";

const resourceDir =
  "test/fixture/index/javascript/resources/webAccessibleScriptWithNoImport";

const inputManifest = {
  web_accessible_resources: [`${resourceDir}/webAccessibleScript.js`],
};

const expectedManifest = {
  web_accessible_resources: [
    `${resourceDir}/webAccessibleScript.js`,
    `assets/${resourceDir}/webAccessibleScript.js`,
  ],
};

export default {
  inputManifest,
  expectedManifest,
  ...getExpectedCode(resourceDir),
};
