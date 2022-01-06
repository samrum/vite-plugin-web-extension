import { getExpectedCode } from "../shared/contentWithChunkedImport";

const resourceDir =
  "test/fixture/index/javascript/resources/contentWithChunkedImport";
const resourceDirRoot = `/${resourceDir}`;
const resourceDirRelative = `./${resourceDir}`;
const inputManifest = {
  content_scripts: [
    {
      js: [`${resourceDirRoot}/content1.js`],
      matches: ["https://*/*", "http://*/*"],
    },
    {
      js: [`${resourceDirRelative}/content2.js`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
};

const expectedManifest = {
  content_scripts: [
    {
      js: [`${resourceDir}/content1.js`],
      matches: ["https://*/*", "http://*/*"],
    },
    {
      js: [`${resourceDir}/content2.js`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
  web_accessible_resources: [
    `assets/${resourceDir}/content1.js`,
    "assets/log.js",
    `assets/${resourceDir}/content2.js`,
  ],
};

export default {
  inputManifest,
  expectedManifest,
  ...getExpectedCode(resourceDir),
};
