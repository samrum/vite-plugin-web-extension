import { getExpectedCode } from "../shared/webAccessibleScriptWithChunkedImport";

const resourceDir =
  "test/fixture/index/javascript/resources/webAccessibleScriptWithChunkedImport";

const inputManifest = {
  web_accessible_resources: [
    {
      resources: [`${resourceDir}/webAccessibleScript1.js`],
      matches: ["https://*/*", "http://*/*"],
    },
    {
      resources: [`${resourceDir}/webAccessibleScript2.js`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
};

const expectedManifest = {
  web_accessible_resources: [
    {
      resources: [
        `assets/${resourceDir}/webAccessibleScript1.js`,
        "assets/log.js",
        `${resourceDir}/webAccessibleScript1.js`,
      ],
      matches: ["https://*/*", "http://*/*"],
      use_dynamic_url: true,
    },
    {
      resources: [
        `assets/${resourceDir}/webAccessibleScript2.js`,
        "assets/log.js",
        `${resourceDir}/webAccessibleScript2.js`,
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
