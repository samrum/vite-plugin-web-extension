import { getExpectedCode } from "../shared/chunkCssRewrite";

const resourceDir = "test/fixture/index/javascript/resources/chunkCssRewrite";

const inputManifest = {
  content_scripts: [
    {
      js: [`${resourceDir}/content1.js`],
      matches: ["https://*/*", "http://*/*"],
    },
    {
      js: [`${resourceDir}/content2.js`],
      matches: ["https://*/*", "http://*/*"],
    },
    {
      js: [`${resourceDir}/contentNoCss.js`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
};

const expectedManifest = {
  content_scripts: [
    {
      js: [`assets/${resourceDir}/content1.js`],
      matches: ["https://*/*", "http://*/*"],
    },
    {
      js: [`assets/${resourceDir}/content2.js`],
      matches: ["https://*/*", "http://*/*"],
    },
    {
      js: [`assets/${resourceDir}/contentNoCss.js`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
  web_accessible_resources: [
    `assets/${resourceDir}/content1.css`,
    `assets/contentShared.css`,
    `assets/${resourceDir}/content2.css`,
  ],
};

export default {
  inputManifest,
  expectedManifest,
  ...getExpectedCode(resourceDir),
};
