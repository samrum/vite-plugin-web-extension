import { getExpectedCode } from "../shared/webAccessibleScriptWithNoImport";

const resourceDir =
  "test/fixture/index/javascript/resources/webAccessibleScriptWithNoImport";

const inputManifest = {
  web_accessible_resources: [
    {
      resources: [`${resourceDir}/webAccessibleScript.js`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
};

const expectedManifest = {
  web_accessible_resources: [
    {
      resources: [
        `${resourceDir}/webAccessibleScript.js`,
        `assets/${resourceDir}/webAccessibleScript.js`,
      ],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
};

export default {
  inputManifest,
  expectedManifest,
  ...getExpectedCode(resourceDir),
};
