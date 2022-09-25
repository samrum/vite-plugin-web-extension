import { getExpectedCode } from "../shared/webAccessibleScriptWithChunkedImport";

const resourceDir =
  "test/fixture/index/javascript/resources/webAccessibleScriptWithChunkedImport";

const inputManifest = {
  web_accessible_resources: [
    {
      resources: [`${resourceDir}/webAccessibleScript1.js`],
      matches: ["<all_urls>"],
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
        `${resourceDir}/webAccessibleScript1.js`,
        `assets/${resourceDir}/webAccessibleScript1.js`,
        "assets/log.js",
      ],
      matches: ["<all_urls>"],
    },
    {
      resources: [
        `${resourceDir}/webAccessibleScript2.js`,
        `assets/${resourceDir}/webAccessibleScript2.js`,
        "assets/log.js",
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
