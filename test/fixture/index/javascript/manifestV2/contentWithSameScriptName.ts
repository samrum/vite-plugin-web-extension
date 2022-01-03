import { getExpectedCode } from "../shared/contentWithSameScriptName";

const resourceDir =
  "test/fixture/index/javascript/resources/contentWithSameScriptName";

const inputManifest = {
  content_scripts: [
    {
      js: [`${resourceDir}/content1/content.js`],
      matches: ["https://*/*", "http://*/*"],
    },
    {
      js: [`${resourceDir}/content2/content.js`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
};

const expectedManifest = {
  content_scripts: [
    {
      js: [`assets/${resourceDir}/content1/content.js`],
      matches: ["https://*/*", "http://*/*"],
    },
    {
      js: [`assets/${resourceDir}/content2/content.js`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
};

export default {
  inputManifest,
  expectedManifest,
  ...getExpectedCode(resourceDir),
};
