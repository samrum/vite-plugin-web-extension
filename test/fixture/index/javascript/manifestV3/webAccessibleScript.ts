import { getExpectedCode } from "../shared/webAccessibleScript";

const resourceDir =
  "test/fixture/index/javascript/resources/webAccessibleScript";

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
        `assets/${resourceDir}/webAccessibleScript.js`,
        `${resourceDir}/webAccessibleScript.js`,
      ],
      matches: ["https://*/*", "http://*/*"],
      use_dynamic_url: true,
    },
  ],
};

export default {
  inputManifest,
  expectedManifest,
  ...getExpectedCode(resourceDir),
};
