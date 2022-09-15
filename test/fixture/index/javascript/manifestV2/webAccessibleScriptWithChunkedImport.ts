import { getExpectedCode } from "../shared/webAccessibleScriptWithChunkedImport";

const resourceDir =
  "test/fixture/index/javascript/resources/webAccessibleScriptWithChunkedImport";

const inputManifest = {
  web_accessible_resources: [
    `${resourceDir}/webAccessibleScript1.js`,
    `${resourceDir}/webAccessibleScript2.js`,
  ],
};

const expectedManifest = {
  web_accessible_resources: [
    `${resourceDir}/webAccessibleScript1.js`,
    `${resourceDir}/webAccessibleScript2.js`,
    `assets/${resourceDir}/webAccessibleScript1.js`,
    "assets/log.js",
    `assets/${resourceDir}/webAccessibleScript2.js`,
  ],
};

export default {
  inputManifest,
  expectedManifest,
  ...getExpectedCode(resourceDir),
};
